
var runme = { 

  log : function(logMsg) { 
    console.log( logMsg );
  },

  debugData: {},
  debugCheck: function( obj ) { 
    if( obj ) { 
      if( runme.debugData.last === obj ) { 
        throw new Error( "Already checked " + obj.nodeName + "!" );
      }
    }
    runme.debugData.last = obj;
  },

  createRep: function(xmlDoc) {
    function UnsupError(element) { 
      this.message = element + " is/are not yet supported.";
    };
    UnsupError.prototype = new Error();
 
    var unsupported = function(child) { 
      throw new UnsupError("'" + child.localName + "' elements");
    }

    /** 
     * Basic parsing
     */

    var schema = new Object();
    var bpmn2Prefix = null;
    const bpmn2SchemaRE = new RegExp( "http://www.omg.org/spec/BPMN/201\\d+/MODEL" );

    var findDefinition = function(node, schema) {
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

    /**
     * root level elements in definitions
     */

    var handleDefinition = function(defNode) { 
      var createdDefRep = {};

      var level = "Root-level"
      for( var n = defNode.children.length-1; n >= 0; --n ) {
        var child = defNode.children[n];
        if( child.nodeType == 1 && child.prefix == bpmn2Prefix ) { 
          if( processRootLevelElement[child.localName] ) { 
            processRootLevelElement[child.localName](child, createdDefRep); 
          } else { 
            throw new Error("Root-level '" + child.localName + "' elements are NOT supported.");
          }
        } 
      }
      return createdDefRep;
    }
 
    var handleProcessChildren = function(procTypeNode, procTypeRep) { 
      procTypeRep.nodes = {};
      for( var n = procTypeNode.children.length-1; n >= 0; --n ) {
        var child = procTypeNode.children[n];
        if( child.nodeType == 1 && child.prefix == bpmn2Prefix ) { 
          if( processProcessElement[child.localName] ) { 
            processProcessElement[child.localName](child, procTypeRep); 
          } else { 
            throw new UnsupError("'" + child.localName + "' elements in a process");
          }
        } 
      }

    }

    var handleProcess = function(procNode, addToDefRep) { 
      if( ! addToDefRep.process ) { 
        addToDefRep.process = [];
      }
      var newProcRep = {};
      addToDefRep.process.push(newProcRep);

      newProcRep.attr = {};
      for( var a = procNode.attributes.length-1; a >= 0; --a ) { 
        var attr = procNode.attributes[a];
        newProcRep.attr[attr.localName] = attr.value;
      } 

      handleProcessChildren(procNode, newProcRep);
    }

    var handleMessage = function(msgNode, addToDefRep) { 
      if( msgNode.nodeType == 1 && msgNode.prefix == bpmn2Prefix ) { 
        // FIXME
        var msgRep = new NodeRepr(msgNode.localName, msgNode.attributes);
        // attributes of process added as message repr. object fields
        for( var a = msgNode.attributes.length-1; a >= 0; --a ) {  
          var attr = msgNode.attributes[a]; 
          msgRep[attr.localName] = attr.value;
          if( attr.prefix != bpmn2Prefix ) { 
            throw new UnsupError( "The " + attr.localName + " (" + attr.prefix + " namespace) on element " + msgNode.localName );
          }
        }
        // recursively add sub-elements
        if( msgNode.children.length > 0 ) { 
          
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

    var processRootLevelElement = { 
      "process"        : handleProcess,
      "message"        : handleMessage,
      "signal"         : unsupported,
      "itemDefinition" : unsupported,
      "error"          : unsupported,
      "dataStore"      : unsupported,
      "escalation"     : unsupported,
      "resource"       : unsupported,
      "interface"      : unsupported
    }

    /**
     * Process level (and sub-level) elements
     */

    /**
     * Basic objects 
     */

    function NodeRepr(type) { 
      this.repType = type;
      // Functional object in candy string 
      // Should contain runtime executable logic
      this.getClosure = function() { 
        return function(context) { 
          // do nothing
        }
      }
    };
    NodeRepr.prototype = new Object();

    function ScriptRepr() { 
      this.script = 'throw new Error("No script defined for scriptTask");';

      this.getClosure = function() { 
        var script = this.script;
        return function(context) { 
          eval(script);
        }
      }
    }
    ScriptRepr.prototype = new Object();

    /**
     * Parsing functions/handlers
     */

    var handleExpression = function( exprNode ) { 
      var expr = {};
      var numChildren = exprNode.childNodes.length-1; 
      runme.debugCheck( exprNode );  // FIXME: delete debug
      if( numChildren == 0 ) { 
        return trimString( exprNode.childNodes[0].data );
      } else { 
        while( numChildren >= 0 ) { 
          if( exprNode.childNodes[numChildren].nodeType == 4 ) {  
            return trimString( exprNode.childNodes[numChildren].data );
          }
          numChildren--;
        }
      }
    }

    var trimString = function( str ) { 
      var newStr = str.replace( "/^\s*/", "" );
      newStr = newStr.replace( "/\s*$/", "" );
      return newStr;
    }

    var handleSequenceFlow = function(seqNode, addToProcRep) { 
      var seqRep = new NodeRepr();

      // attributes
      for( var sa = seqNode.attributes.length-1; sa >= 0; --sa ) { 
        var attr = seqNode.attributes[sa];
        switch( attr.localName ) { 
          case "id": seqRep.id = attr.value;
            break;
          case "sourceRef": seqRep.from = attr.value;
            break;
          case "targetRef": seqRep.to = attr.value;
            break;
        }
      }

      // expressions
      for( var c = seqNode.children.length-1; c >= 0; --c ) { 
        var child = seqNode.children[c];
        if( child.nodeType == 1 && child.nodeName == "conditionExpression" ) { 
          seqRep["condition"] = handleExpression( child );
          break;
        } 
      }

      if( ! addToProcRep.seq ) { 
        addToProcRep.seq = [];
      }
      addToProcRep.seq.push(seqRep);
    }

    var handleSubProcess = function(subProcessNode, parentRep) { 
      var subProcRep = new NodeRepr(subProcessNode.localName);
      var attrs = {};
      for( var sa = subProcessNode.attributes.length-1; sa >= 0; --sa ) { 
        var attr = subProcessNode.attributes[sa];
        if( attr.localName == "id" ) { 
          subProcRep.id = attr.value;
        } else { 
          attrs[attr.localName] = attr.value;
        }
      }

      if( subProcRep.id ) { 
        parentRep.nodes[subProcRep.id] = subProcRep;
      } else { 
        throw new Error( "Node " + subProcRep.localName + " is missing an id field." );
      }

      handleProcessChildren(subProcessNode, subProcRep);

      return subProcRep;
    }

    var handleEndEvent = function(endEventNode, endParentRep) {
      var endRep = new NodeRepr(endEventNode.localName);
      for( var ea = endEventNode.attributes.length-1; ea >= 0; --ea ) { 
        if( endEventNode.attributes[ea].localName == "id" ) { 
          endRep.id = endEventNode.attributes[ea].value;
        }
      }

      if( endEventNode.children.length > 0 ) { 
        endRep.events = [];
      }
      for( var ec = endEventNode.children.length-1; ec >= 0; --ec ) { 
          var child = endEventNode.children[ec];
          switch( child.nodeName ) { 
            case "terminateEventDefinition": 
              endRep.events.push( {
                "type" : "terminate" 
              });
              break;
            case "incoming":
            case "outgoing":
              break;
            default: 
              throw new UnsupError( child.nodeName + " events in an End Event" );
          }
      }

      if( endRep.id ) { 
        endParentRep.nodes[endRep.id] = endRep;
      } else { 
        throw new Error( "Node " + endRep.localName + " is missing an id field." );
      }

      return endRep;
    }

    var handleGateway = function(gatewayNode, gatewayParentRep) { 
      var gatewayRep = new NodeRepr(gatewayNode.localName);
      for( var sa = gatewayNode.attributes.length-1; sa >= 0; --sa ) { 
        switch( gatewayNode.attributes[sa].localName ) { 
          case "id": 
            gatewayRep.id = gatewayNode.attributes[sa].value;
            break;
          case "gatewayDirection": 
            gatewayRep["direction"] = gatewayNode.attributes[sa].value;
            break;
        }
      }

      if( gatewayRep.id ) { 
        gatewayParentRep.nodes[gatewayRep.id] = gatewayRep;
      } else { 
        throw new Error( "Node " + gatewayNode.localName + " does not have an id." );
      }

      return gatewayRep;
    }

    // UNFINISHED
    var handleEvent = function(eventNode, addToProcRep) {
      var eventRep = new NodeRepr(eventNode.localName);
      for( var ea = eventNode.attributes.length-1; ea >= 0; --ea ) { 
        if( eventNode.attributes[ea].localName == "id" ) { 
          eventRep.id = eventNode.attributes[ea].value;
        }
      }

      if( eventRep.id ) { 
        parentRep.nodes[childRep.id] = childRep;
      } else { 
        throw new Error( "Node " + childRep.localName + " is missing an id field." );
      }

      return eventRep;
    }

    var handleScriptTask = function(scriptNode, addToProcRep) { 
      var scriptRep = new ScriptRepr(scriptNode.localName);
      for( var sa = scriptNode.attributes.length-1; sa >= 0; --sa ) { 
        if( scriptNode.attributes[sa].localName == "id" ) { 
          scriptRep.id = scriptNode.attributes[sa].value;
        }
      }
      for( var c = scriptNode.children.length-1; c >= 0; --c ) { 
        var child = scriptNode.children[c];
        if( child.nodeType == 1 && child.nodeName == "script" ) { 
          scriptRep["script"] = handleExpression( child );
          break;
        } 
      }

      if( scriptRep.id ) { 
        addToProcRep.nodes[scriptRep.id] = scriptRep;
      } else { 
        throw new Error( "Node " + scriptNode.localName + " does not have an id." );
      }

      return scriptRep;
    }

    var handleScratch = function(scratchNode, addToProcRep) { 
      var stepRep = new NodeRepr(scratchNode.localName);
      for( var sa = scratchNode.attributes.length-1; sa >= 0; --sa ) { 
        if( scratchNode.attributes[sa].localName == "id" ) { 
          stepRep.id = scratchNode.attributes[sa].value;
        }
      }

      if( stepRep.id ) { 
        addToProcRep.nodes[stepRep.id] = stepRep;
      } else { 
        throw new Error( "Node " + scratchNode.localName + " does not have an id." );
      }

      return stepRep;
    }

    var processProcessElement = { 
      sequenceFlow: handleSequenceFlow,        // X

      subProcess: handleSubProcess,            // X
      adHocSubProcess: unsupported,            //
      transaction: unsupported,                //
      
      callActivity: unsupported,               //

      // task
      task: handleScratch,                     // ?
      businessRuleTask: unsupported,           //
      manualTask: unsupported,                 //
      receiveTask: unsupported,                //
      scriptTask: handleScriptTask,            // X
      sendTask: unsupported,                   //
      serviceTask: unsupported,                //
      userTask: handleScratch,                 // ?

      // gateway
      complexGateway: unsupported,             //
      eventBasedGateway: unsupported,          //
      exclusiveGateway: handleScratch,         // ?
      inclusiveGateway: handleScratch,         // ?
      parallelGateway: handleGateway,          //

      // event
      startEvent: handleScratch,               // ?
      endEvent: handleEndEvent,                // X
      implicitThrowEvent: unsupported,         //
      intermediateCatchEvent: unsupported,     //
      intermediateThrowEvent: unsupported,     //
      boundaryEvent: unsupported,              //
      event: unsupported,                      //
      
      // extra
      dataObject: unsupported,                 //
      property: unsupported,                   //
      dataObjectReference: unsupported,        //
      dataStoreReference: unsupported,         //
     
      callChoreography: unsupported,           //
      subChoreography: unsupported,            //
      choreographyTask: unsupported,           //

      // signal
      signal: unsupported,                     //
      message: unsupported,                    //
    };

    // Create (Intermediate) Representation: MAIN

    var defNode = findDefinition(xmlDoc, schema);
    var newDefRep = handleDefinition(defNode);

    // return process instance (array)
    return newDefRep;
  },

  // ----
  // CREATE GRAPH (ON THE BASIS OF THE INTERMEDIATE REPRESENTATION)
  // ----
  
  createGraph: function(initDefRep) {
    function UnsupError(element) { 
      this.message = element + " is/are not yet supported.";
    };
    UnsupError.prototype = new Error();

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
      // runme.log( "  | " + newNode.beg + " > " + newNode.end + " [" + endMap[newNode.end] + ", " + begMap[newNode.beg] + "]" ); // DBG

      // Add to ENDS
      if( ! endMap[newNode.end] ) { 
        endMap[newNode.end] = [newNode];
      } else { 
        runme.log( " *E " + newNode.end + " < " + newNode.beg ); // DBG
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
          runme.log( "r (" + newNode.beg + " >) " + startNode.beg + " > " + startNode.end ); // DBG
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
        runme.log( " *B " + newNode.beg + " > " + newNode.end ); // DBG
        newNode.postFork = true;
        var begs = begMap[newNode.beg];
        if( begs.length == 1 ) { 
          begs[0].postFork = true;
        }
        begs.push(newNode);
      }
    }

    var createProcessGraph = function(thisProcRep) { 
      var s = thisProcRep.seq.length;
      while( --s >= 0 ) {
        var seq = thisProcRep.seq[s];
        var newNode = null;
  
        // add to end
        if( endMap[seq.from] ) { 
          runme.log( "< (" + endMap[seq.from][0].beg + " >) " + seq.from + " -> " + seq.to ); // DBG
          if( ! nextMap[seq.to] ) { 
            nextMap[seq.to] = [];
          }
          newNode = new GraphNode(seq.from, seq.to);
          newNode.next = nextMap[seq.to];
  
          if( ! nextMap[seq.from] ) { 
            nextMap[seq.from] = [];
          }
          nextMap[seq.from].push(newNode);
        } 
  
        graphStart: 
        for( var b = graph.start.length-1; b >= 0; --b ) { 
          var begin = graph.start[b];
  
          // insert before begin
          if( seq.to == begin.beg ) { 
            runme.log( "> " + seq.from + " -> " + seq.to + " (> " + begin.end + ")" ); // DBG
            if( ! nextMap[seq.to] ) { 
              nextMap[seq.to] = [];
            }
            var next = nextMap[seq.to];
            next.push(begin);
            if( ! newNode ) { 
              newNode = new GraphNode(seq.from, seq.to);
              newNode.next = next;
            }
  
            graph.start[b] = newNode;
          }
        }
  
        // neither beg or end linked anywhere
        if( ! newNode ) {
          runme.log( "! " + seq.from + " -> " + seq.to ); // DBG
          if( ! nextMap[seq.to] ) { 
            nextMap[seq.to] = [];
          }
          newNode = new GraphNode(seq.from, seq.to);
          newNode.next = nextMap[seq.to];
  
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
          runme.log( "X " + graph.start[s].beg + " -> " + graph.start[s].end ); // DBG
        }
      }
      if( newStart.length != graph.start ) { 
        graph.start = newStart;
      }
  
      return graph;
    }

    // ---
    // MAIN: createGraph
    // ---

    var i = initDefRep.process.length;
    while( --i >= 0 ) { 
      var proc = initDefRep.process[i];
      proc.graph = createProcessGraph(proc);
      delete proc.seq;

      if( i < initDefRep.process.length-1 ) { 
        throw new UnsupError( "Multiple process definitions in one file" );
      }
    }
   
    return initDefRep;
  },
  
  // ----
  // COMPILE INSTANCE (ON THE BASIS OF THE INTERMEDIATE GRAPH REP)
  // ----
 
  compileInstance: function(thisDefRep) { 

    function UnsupError(element) { 
      this.message = element + " is/are not yet supported.";
    };
    UnsupError.prototype = new Error();

    var compileProcessInstance = function(procRep, wholeDefRep) { 

      if( procRep.graph.start.length > 1 ) {  
        // FIXME: eventually supported!!
        throw new UnsupError( "Multiple start nodes" );
      }

      procRep.inst = traverseGraph(procRep.graph.start[0], procRep.nodes, []);
      // delete procRep.nodes; // FIXME: after debug, put back in
      // FIXME: once we know for sure: delete procRep.graph;

    }

    var visited = {};

    var traverseGraph = function(seq, nodes, candyString) { 

      while( seq != null ) { 
        candyString.push(nodes[seq.beg].getClosure());

        switch(seq.next.length) { 
          case 0:
            candyString.push(nodes[seq.end].getClosure());
            seq = null;
            break;
          case 1:
            // check if visited? 
            if( visited[seq.end] ) { 
              seq = null;
              continue;
            }
            visited[seq.end] = true;

            seq = seq.next[0];
            break;
          default: 
            throw new UnsupError( "Branching processes." );
            var b = seq.next.length;
            while( --b >= 0 ) { 
              // FIXME: visited!
            }
        }

      }

      return candyString;
    }


    var i = thisDefRep.process.length;
    while( --i >= 0 ) { 
      compileProcessInstance(thisDefRep.process[i], thisDefRep);
      if( i < thisDefRep.process.length-1 ) { 
        throw new UnsupError( "Multiple (sub-)processes" );
      }
    }

    return thisDefRep;
  },

  // ----
  // OPTIMIZE (THE INTERMEDIATE REPRESENTATION)
  // ----
  
  optimize: function(compiledProcRep) { 
    return compiledProcRep;
  },
 
  // ---
  // COMPILE (MAIN)
  // ---

  compile: function(xmlDoc) {
    
    var defRep = this.createRep(xmlDoc);
    defRep = this.createGraph(defRep);
    // defRep = this.optimize(defRep);
    defRep = this.compileInstance(defRep);
  
    return defRep;
  }

}; 
