
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
      adHocSubProcess: "sub", subProcess: "sub", 
      callActivity: "sub", transaction: "sub",
      
      // concrete
      complexGateway: "step", eventBasedGateway: "step", 
      exclusiveGateway: "step", inclusiveGateway: "step", 
      parallelGateway: "step",
      
      businessRuleTask: "step", manualTask: "step", receiveTask: "step",
      scriptTask: "step", sendTask: "step", serviceTask: "step",
      userTask: "step", task: "step",
      
      endEvent: "step", startEvent: "step",
      
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
    var analyzeDefinition = function(defNode, createdProcRep) { 
      for( var n = defNode.childNodes.length-1; n >= 0; --n ) {
        var child = defNode.childNodes[n];
        if( child.nodeType == 1 && child.prefix == bpmn2Prefix ) { 
          switch(child.localName) { 
            case "process":
              var procNode = analyzeProcess(child, createdProcRep);
              break;
            case "message":
            case "signal":
              analyzeMessage(child, createdProcRep);
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
    var analyzeProcess = function(node, addToProcRep) { 
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
          if( child.childNodes.length > 0 ) { 
            recursiveAddToNodeRep(child, nodeRep);
          }

          // add to process representation
          var typeMap = addToProcRep[elementCategory[nodeRep.repType]];
          if( ! typeMap ) { 
            throw new UnsupError( nodeRep.repType + " elements" );
          }
          if( nodeRep.repType != "sequenceFlow" ) { 
            typeMap[nodeRep.id] = nodeRep;
            if( ! nodeRep.id ) { 
              throw new Error( "A " + nodeRep.repType + " element must have an 'id' attribute." );
            }
          } else { 
            typeMap[typeMap.length] = nodeRep;
          }
        } 
      }
      // attributes of process added as process repr. object fields
      for( var a = child.attributes.length-1; a >= 0; --a ) {  
        var attr = child.attributes[a]; 
        addToProcRep[attr.localName] = attr.value;
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
          if( rChild.attributes.length > 0 || rChild.childNodes.length > 0 ) { 
            var childNodeRep = {};
            for( var ra = rChild.attributes.length-1; ra >= 0; --ra ) { 
              if( rChild.attributes[ra].prefix == bpmn2Prefix ) { 
                childNodeRep[ra.localName] = rChild.attributes[ra].value;
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
    var analyzeMessage = function(msgNode, addToProcRep) { 
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
        var typeMap = addToProcRep[elementCategory[msgRep.repType]];
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
    var newProcRep = {};
    for( var elem in elementCategory ) {
      if( newProcRep[elementCategory[elem]] ) {
        continue;
      }
      if( elem != "sequenceFlow" ) { 
        newProcRep[elementCategory[elem]] = {};
      } else { 
        newProcRep[elementCategory[elem]] = [];
      }
    }
  
    analyzeDefinition(defNode, newProcRep);

    // return process instance (array)
    return newProcRep;
  },

  // ----
  // COMPILE INSTANCE (ON THE BASIS OF THE INTERMEDIATE REPRESENTATION)
  // ----
  
  compileInstance: function(initProcRep) {
    var graph = {
      start: []
    }; 
    var endMap = new Object();
    var begMap = new Object();

    function GraphNode(beg, end) { 
      this.beg = beg;
      this.end = end;
    };
    function PreMergeNode(next) { 
      this.next = next;
      this.preMerge = true;
    };

    var addToEndAndBegMap = function(newNode, graphRep) {
      // DBG
      console.log( "  | " + newNode.beg + " > " + newNode.end + " [" + endMap[newNode.end] + ", " + begMap[newNode.beg] + "]" );
      if( ! endMap[newNode.end] ) { 
        // console.log( "  +E " + newNode.end + " < " + newNode.beg ); // DBG
        endMap[newNode.end] = [newNode];
      } else { 
        newNode.preMerge = true;
        var ends = endMap[newNode.end];
        if( ends.length == 1 ) { 
          ends[0].preMerge = true;
        }
        ends.push(newNode);

      }  
      var newStart = [];
      for( var s = graphRep.start.length-1; s >= 0; --s ) { 
        var startNode = graphRep.start[s];
        if( startNode.beg == newNode.end ) { 
          console.log( "  <R> " + newNode.beg + " > [" + newNode.end + "] > " + startNode.end ); // DBG
          if( ! newNode.next ) { 
            newNode.next = [startNode];
          } else { 
            newNode.next.push(startNode);
          }
        } else { 
          newStart.push(startNode);
        }
      }
      if( newStart.length != graphRep.start.length ) { 
        graphRep.start = newStart;
      }

      if( ! begMap[newNode.beg] ) { 
        // console.log( "  +B " + newNode.beg + " > " + newNode.end ); // DBG
        begMap[newNode.beg] = [newNode];
      } 
      else { 
        newNode.postFork = true;
        var begs = begMap[newNode.beg];
        if( begs.length == 1 ) { 
          begs[0].postFork = true;
        }
        begs.push(newNode);
      }
    }

    for( var s = initProcRep.seq.length-1; s >= 0; --s ) {
      var seq = initProcRep.seq[s];
      var newNode = null;

      // add to end
      if( endMap[seq.sourceRef] ) { 
        console.log( "< (" + endMap[seq.sourceRef][0].beg + " > ) " + seq.sourceRef + " -> " + seq.targetRef );
        newNode = new GraphNode(seq.sourceRef, seq.targetRef);

        var end = endMap[seq.sourceRef];
        if( ! end[0].next ) { 
          end[0].next = [newNode];
        } else { 
          end[0].next.push(newNode);
        }
        // REV: merge/fork situation
        for( var e = end.length-1; e > 0; --e ) { 
          end[e].next = end[0].next;
        }

        addToEndAndBegMap( newNode, graph );
      } else { 
        graphStart: 
        for( var b = graph.start.length-1; b >= 0; --b ) { 
          var begin = graph.start[b];
  
          // insert before begin
          if( begin.beg == seq.targetRef ) { 
            console.log( "> " + seq.sourceRef + " -> " + seq.targetRef + " ( > " + begin.end + " )" ); // DBG
            newNode = new GraphNode(seq.sourceRef, seq.targetRef);
  
            newNode.next = [begin];
            graph.start[b] = newNode;
  
            addToEndAndBegMap( newNode, graph );
            break graphStart;
          }
        }
      }

      // neither beg or end linked anywhere
      if( ! newNode ) {
        console.log( "! " + seq.sourceRef + " -> " + seq.targetRef );
        newNode = new GraphNode(seq.sourceRef, seq.targetRef);
        graph.start.push(newNode);
        addToEndAndBegMap( newNode, graph );
      }
    }

    return graph;
  },
  
  // ----
  // OPTIMIZE (THE INTERMEDIATE REPRESENTATION)
  // ----
  
  optimize: function(compProcRep) { 
  },
 
  // ---
  // MAIN
  // ---

  compile: function(xmlDoc) {
    
    var procRep = this.createRep(xmlDoc);
    procRep = this.optimize(procRep);
    var compiledProcess = this.compileInstance(procRep);
  
    return compiledProcess;
  }

} 
