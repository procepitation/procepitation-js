
var compiler = { 

  createRep: function(xmlDoc) {
  
    var schema = new Object();
    var bpmn2Prefix = null;
    var bpmn2SchemaRE = new RegExp( "http://www.omg.org/spec/BPMN/201\\d+/MODEL" );

    function NodeRepr(type) { 
      this.repType = type;
    };
    NodeRepr.prototype = new Object();
      
    function UnsupError(element) { 
      this.message = element + " is/are not yet supported.";
    };
    UnsupError.prototype = new Error();

    var elementCategory = { 
      // seq
      sequenceFlow: "seq", 
      
      // sub
      subProcess: "sub", adHocSubProcess: "sub", transaction: "sub",
      
      // concrete
      startEvent: "step", endEvent: "step", 

      callActivity: "step", 

      complexGateway: "step", eventBasedGateway: "step", 
      exclusiveGateway: "step", inclusiveGateway: "step", 
      parallelGateway: "step",

      businessRuleTask: "step", manualTask: "step", receiveTask: "step",
      scriptTask: "step", sendTask: "step", serviceTask: "step",
      userTask: "step", task: "step",
      
      // event
      implicitThrowEvent: "event", intermediateCatchEvent: "event", 
      intermediateThrowEvent: "event", boundaryEvent: "event", event: "event",
      
      // extra
      dataObject: "data", property: "data",
      dataObjectReference: "data", dataStoreReference: "data",
     
      callChoreography: "choreography", subChoreography: "choreography",                                      
      choreographyTask: "choreography",

      // signal
      signal: "msg", message: "msg"
    }

    // Create (Intermediate) Representation: findDefinition(node) 
    var findDefinition = function(node) {
      var nodeName = "definitions";
      for( var d = node.childNodes.length-1; d >= 0; --d ) { 
        var child = node.childNodes[d];
        if( child.nodeType == 1 && child.localName == nodeName ) { 
          node = child;
          break;
        }
      }
      if( node.localName != nodeName ) { 
        throw new Error( "Element local name is " + node.localName + "; expected '" + nodeName + "'" );
      } 
      for( var a = node.attributes.length-1; a >= 0; --a ) { 
        var attr = node.attributes[a];
        if( /^xmlns$/i.test(attr.prefix) ) { 
          schema[attr.localName] = attr.value;
          if( bpmn2SchemaRE.test(attr.value) ) { 
            bpmn2Prefix = attr.localName;
          }  
        } 
      }
      return node;
    }
  
    // Create (Intermediate) Representation: analyzeDefinition(node) 
    var analyzeDefinition = function(defNode, createdDefRep) { 
      for( var n = defNode.childNodes.length-1; n >= 0; --n ) {
        var child = defNode.childNodes[n];
        if( child.nodeType == 1 && child.prefix == bpmn2Prefix ) { 
          switch(child.localName) { 
            case "process":
              var procNode = analyzeProcess(child, createdDefRep);
              break;
            case "message":
            case "signal":
              analyzeMessage(child, createdDefRep);
              break;
            case "itemDefinition":
            case "error":
            case "dataStore":
            case "escalation":
            case "resource":
            case "interface":
              throw new UnsupError("Root-level '" + child.localName + "' elements");
              break;
            default: 
              throw new Error("Root-level '" + child.localName + "' elements are NOT supported.");
          }
        }
      }
    }

    // Create (Intermediate) Representation: analyzeProcess(node) 
    var analyzeProcess = function(node, addToDefRep) { 
      // elements of process added to process repr. collection objects
      for( var c = node.childNodes.length-1; c >= 0; --c ) {
        if( node.childNodes[c].nodeType == 1 && node.childNodes[c].prefix == bpmn2Prefix ) { 
          var child = node.childNodes[c];
  
          var nodeRep = new NodeRepr(child.localName);
          for( var a = child.attributes.length-1; a >= 0; --a ) {  
            var attr = child.attributes[a]; 
            nodeRep[attr.localName] = attr.value;
            if( attr.prefix != bpmn2Prefix ) { 
              throw new UnsupError( "The " + attr.localName + " (" + attr.prefix + " namespace) on element " + child.localName );
            }
          }

          var type = elementCategory[nodeRep.repType];
          var typeMap = addToDefRep[type];
          if( elementCategory[child.localName] == "sub" ) { 
            if( ! typeMap ) { 
              typeMap = addToDefRep[type] = {};
            }
            typeMap[nodeRep.id] = {};
            typeMap[nodeRep.id].attr = [];
            analyzeProcess(child, typeMap[nodeRep.id]);
          }
          else { 
            if( child.childNodes.length > 0 ) { 
              recursiveAddToNodeRep(child, nodeRep);
            }

            // add to process representation
            if( nodeRep.repType == "sequenceFlow" ) { 
              if( ! typeMap ) {  // TEST
                typeMap = addToDefRep[type] = [];
              }
              typeMap.push( nodeRep );
            } else { 
              if( ! typeMap ) { 
                typeMap = addToDefRep[type] = {};
              }
              typeMap[nodeRep.id] = nodeRep;
              if( ! nodeRep.id ) { 
                throw new Error( "A " + nodeRep.repType + " element must have an 'id' attribute." );
              }
            }
          }
          
        } 
      }

      // attributes of process added as process repr. object fields
      for( var a = child.attributes.length-1; a >= 0; --a ) {  
        var attr = child.attributes[a]; 
        addToDefRep.attr[attr.localName] = attr.value;
        if( attr.prefix != bpmn2Prefix ) { 
          throw new UnsupError( "The " + attr.localName + " (" + attr.prefix + " namespace) on element " + child.localName );
        }
      }
    }

    var recursiveAddToNodeRep = function(rNode, rNodeRep) { 
      for( var rc = rNode.childNodes.length-1; rc >= 0; --rc ) { 
        rChild = rNode.childNodes[rc];
        // bpmn2 element
        if( rChild.nodeType == 1 && rChild.prefix == bpmn2Prefix ) { 
          if( rNodeRep[rChild.localName] ) { 
            throw new Error( rNode.localName + "." + rChild.localName + " already exists in process representation" );
          }
          console.log( "+ " + rChild.localName ); // DBG
          if( rChild.attributes.length > 0 || rChild.childNodes.length > 0 ) { 
            var childNodeRep = {};
            for( var ra = rChild.attributes.length-1; ra >= 0; --ra ) { 
              if( rChild.attributes[ra].prefix == bpmn2Prefix ) { 
                console.log( ": " + rChild.attributes[ra].localName + " [" + rChild.attributes[ra].value + "]" ); // DBG
                childNodeRep[rChild.attributes[ra].localName] = rChild.attributes[ra].value;
              }
            }
            rNodeRep[rChild.localName] = childNodeRep;
            if( rChild.childNodes.length > 0 ) { 
              recursiveAddToNodeRep(rChild, rNodeRep[rChild.localName]);
            } 
          } else { 
            rNodeRep[rChild.localName] = true;
          }
        // text
        } else if( ( rChild.nodeType == 3 || rChild.nodeType == 4 ) && /\S/.test(rChild.data) ) { 
          rNodeRep["#data"] = rChild.data;
        }
      }
    }

    // Create (Intermediate) Representation: signal
    var analyzeMessage = function(msgNode, addToDefRep) { 
      if( msgNode.nodeType == 1 && msgNode.prefix == bpmn2Prefix ) { 
        var msgRep = new NodeRepr(msgNode.localName);
        // attributes of process added as message repr. object fields
        for( var a = msgNode.attributes.length-1; a >= 0; --a ) {  
          var attr = msgNode.attributes[a]; 
          msgRep[attr.localName] = attr.value;
          if( attr.prefix != bpmn2Prefix ) { 
            throw new UnsupError( "The " + attr.localName + " (" + attr.prefix + " namespace) on element " + msgNode.localName );
          }
        }
        // recursively add sub-elements
        if( msgNode.childNodes.length > 0 ) { 
          recursiveAddToNodeRep(msgNode, msgRep);
        }
        // add to process repr. 
        var typeMap = addToDefRep[elementCategory[msgRep.repType]];
        typeMap[msgRep.id] = msgRep;
        if( ! msgRep.id ) { 
          throw new Error( "A " + msgRep.repType + " element must have an 'id' attribute." );
        }
      } else { 
        throw new UnsupError( "Root-Level '" + msgNode.localName + "' elements in the " + msgNode.prefix + " namespace)" );
      }
    }

    // Create (Intermediate) Representation: MAIN

    var defNode = findDefinition(xmlDoc);
    
    // (prepare the process representation object)
    var newDefRep = {};
    newDefRep.seq = [];
    newDefRep.attr = [];
  
    analyzeDefinition(defNode, newDefRep);

    // return process instance (array)
    return newDefRep;
  },

  // ----
  // COMPILE INSTANCE (ON THE BASIS OF THE INTERMEDIATE REPRESENTATION)
  // ----
  
  compileInstance: function(initDefRep) {
    var graph = {
      start: []
    }; 
    var endMap = new Object();
    var begMap = new Object();
    var nextMap = new Object();

    function GraphNode(beg, end) { 
      this.beg = beg;
      this.end = end;
    };

    var addToEndAndBegMap = function(newNode, graphRep) {
      // console.log( "  | " + newNode.beg + " > " + newNode.end + " [" + endMap[newNode.end] + ", " + begMap[newNode.beg] + "]" ); // DBG

      // Add to ENDS
      if( ! endMap[newNode.end] ) { 
        endMap[newNode.end] = [newNode];
      } else { 
        console.log( " *E " + newNode.end + " < " + newNode.beg ); // DBG
        newNode.preMerge = true;
        var ends = endMap[newNode.end];
        if( ends.length == 1 ) { 
          ends[0].preMerge = true;
        }
        ends.push(newNode);
      }  

      // Remove from STARTS if necessary
      var newStart = [];
      for( var s = graphRep.start.length-1; s >= 0; --s ) { 
        var startNode = graphRep.start[s];
        if( startNode.beg == newNode.end ) { 
          console.log( "r (" + newNode.beg + " >) " + startNode.beg + " > " + startNode.end ); // DBG
          nextMap[newNode.end].push(startNode);
        } else { 
          newStart.push(startNode);
        }
      }
      if( newStart.length != graphRep.start.length ) { 
        graphRep.start = newStart;
      }

      // Add to BEGS
      if( ! begMap[newNode.beg] ) { 
        begMap[newNode.beg] = [newNode];
      } 
      else { 
        console.log( " *B " + newNode.beg + " > " + newNode.end ); // DBG
        newNode.postFork = true;
        var begs = begMap[newNode.beg];
        if( begs.length == 1 ) { 
          begs[0].postFork = true;
        }
        begs.push(newNode);
      }
    }

    for( var s = initDefRep.seq.length-1; s >= 0; --s ) {
      var seq = initDefRep.seq[s];
      var newNode = null;

      // add to end
      if( endMap[seq.sourceRef] ) { 
        console.log( "< (" + endMap[seq.sourceRef][0].beg + " >) " + seq.sourceRef + " -> " + seq.targetRef ); // DBG
        if( ! nextMap[seq.targetRef] ) { 
          nextMap[seq.targetRef] = [];
        }
        newNode = new GraphNode(seq.sourceRef, seq.targetRef);
        newNode.next = nextMap[seq.targetRef];

        if( ! nextMap[seq.sourceRef] ) { 
          nextMap[seq.sourceRef] = [];
        }
        nextMap[seq.sourceRef].push(newNode);
      } 

      graphStart: 
      for( var b = graph.start.length-1; b >= 0; --b ) { 
        var begin = graph.start[b];

        // insert before begin
        if( seq.targetRef == begin.beg ) { 
          console.log( "> " + seq.sourceRef + " -> " + seq.targetRef + " (> " + begin.end + ")" ); // DBG
          if( ! nextMap[seq.targetRef] ) { 
            nextMap[seq.targetRef] = [];
          }
          var next = nextMap[seq.targetRef];
          next.push(begin);
          if( ! newNode ) { 
            newNode = new GraphNode(seq.sourceRef, seq.targetRef);
            newNode.next = next;
          }

          graph.start[b] = newNode;
        }
      }

      // neither beg or end linked anywhere
      if( ! newNode ) {
        console.log( "! " + seq.sourceRef + " -> " + seq.targetRef ); // DBG
        if( ! nextMap[seq.targetRef] ) { 
          nextMap[seq.targetRef] = [];
        }
        newNode = new GraphNode(seq.sourceRef, seq.targetRef);
        newNode.next = nextMap[seq.targetRef];

        graph.start.push(newNode);
      } 

      addToEndAndBegMap( newNode, graph );
    }

    // clean up starts
    var newStart = [];
    for( var s = graph.start.length-1; s >= 0; --s ) { 
      if( ! endMap[graph.start[s].beg] ) { 
        newStart.push( graph.start[s] );
      } else { 
        console.log( "X " + graph.start[s].beg + " -> " + graph.start[s].end ); // DBG
      }
    }
    if( newStart.length != graph.start ) { 
      graph.start = newStart;
    }

    return graph;
  },
  
  // ----
  // OPTIMIZE (THE INTERMEDIATE REPRESENTATION)
  // ----
  
  optimize: function(compiledProcRep) { 
    return compiledProcRep;
  },
 
  // ---
  // MAIN
  // ---

  compile: function(xmlDoc) {
    
    var defRep = this.createRep(xmlDoc);
    defRep = this.optimize(defRep);
    var compiledProcess = this.compileInstance(defRep);
  
    return compiledProcess;
  }

} 
