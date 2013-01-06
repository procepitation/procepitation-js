
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
    }
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
      dataObject: "data", dataObjectReference: "data", 
      dataStoreReference: "data",
     
      callChoreography: "choreography", subChoreography: "choreography",                                      
      choreographyTask: "choreography"
    }

    // Create (Intermediate) Representation: findDefinition(node) 
    var findDefinition = function(node) {
      var nodeName = "definitions";
      for( var d = (node.childNodes.length-1); d >= 0; --d ) { 
        var child = node.childNodes[d];
        if( child.nodeType == 1 && child.localName == nodeName ) { 
          node = child;
          break;
        }
      }
      if( node.localName != nodeName ) { 
        throw new Error( "Element local name is " + node.localName + "; expected '" + nodeName + "'" );
      } 
      for( var a = (node.attributes.length-1); a >= 0; --a ) { 
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
      for( var n = (defNode.childNodes.length-1); n >= 0; --n ) {
        var child = defNode.childNodes[n];
        if( child.nodeType == 1 && child.prefix == bpmn2Prefix ) { 
          switch(child.localName) { 
            case "process":
              var procNode = analyzeProcess(child, createdProcRep);
              break;
            case "itemDefinition":
            case "error":
            case "signal":
            case "dataStore":
            case "escalation":
            case "message":
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
      for( var c = (node.childNodes.length-1); c >= 0; --c ) {
        if( node.childNodes[c].nodeType == 1 && node.childNodes[c].prefix == bpmn2Prefix ) { 
          var child = node.childNodes[c];
  
          var nodeRep = new NodeRepr(child.localName);
          for( var a = (child.attributes.length-1); a >= 0; --a ) {  
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
    }

    var recursiveAddToNodeRep = function(rNode, rNodeRep) { 
      for( var rc = rNode.childNodes.length-1; rc >= 0; --rc ) { 
        rChild = rNode.childNodes[rc];
        // bpmn2 element
        if( rChild.nodeType == 1 && rChild.prefix == bpmn2Prefix ) { 
          if( rChild.attributes.length > 0 || rChild.childNodes.length > 0 ) { 
            var childNodeRep = {};
            for( var ra = rChild.attributes.length-1; ra >= 0; --ra ) { 
              if( attr.prefix == bpmn2Prefix ) { 
                childNodeRep[ra.localName] = ra.value;
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
        } else if( rChild.nodeType == 3 && /\S/.test(rChild.data) ) { 
          rNodeRep[rChild.nodeName] = rChild.data;
        }
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
