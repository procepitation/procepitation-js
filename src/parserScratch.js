
function start() { 
  console.log("---");
  console.log( "Started: " +  new Date().toLocaleTimeString());
  console.log("");
};

start();

// var bpmn2File = "MultiThreadServiceProcess.bpmn2";
var bpmn2File = "StartToEndTest.testStartToEnd.bpmn20.xml";

if(window.XMLHttpRequest)  {
  // code for IE7+, Firefox, Chrome, Opera, Safari
  xmlhttp = new XMLHttpRequest();
} else {
  // code for IE6, IE5
  xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
}

xmlhttp.open("GET",bpmn2File,false);
xmlhttp.send();
bpmn2Txt = xmlhttp.responseText;

if(window.DOMParser) {
  parser = new DOMParser();
  xmlDoc = parser.parseFromString(bpmn2Txt,"text/xml");
} else {
  // Internet Explorer
  xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
  xmlDoc.async = false;
  xmlDoc.loadXML(bpmn2Txt); 
}

// =====
// BASE TYPES
// =====

function Perror(element) { 
  this.message = element + " is/are not yet supported.";
}
Perror.prototype = new Error();

// ----
// COMPILATION
// ----

var createRepresentation = function(node) {

  // ---
  // SETUP
  // ---
  var schema = new Object();
  var bpmn2Prefix = null;
  var bpmn2SchemaRE = new RegExp( "http://www.omg.org/spec/BPMN/201\\d+/MODEL" );

  // ---
  // Functions
  // ---
  var definition = function(node) {
    var nodeName = "definitions";
    for( var possibleDefNode = (node.childNodes.length-1); possibleDefNode >= 0; --possibleDefNode ) { 
      var child = node.childNodes[possibleDefNode];
      if( child.nodeType == 1 && child.localName == nodeName ) { 
        node = child;
        break;
      }
    }
    if( node.localName != nodeName ) { 
      throw new Perror( "Element local name is " + node.localName + "; expected '" + nodeName + "'" );
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
    
  var elementCategory = { 
    // meta
    sequenceFlow: "meta",
    callActivity: "meta",
    
    // sub
    adHocSubProcess: "sub",
    subProcess: "sub",
    transaction: "sub",
    
    // concrete
    complexGateway: "step",
    eventBasedGateway: "step",
    exclusiveGateway: "step",
    inclusiveGateway: "step",
    parallelGateway: "step",
    
    businessRuleTask: "step",
    manualTask: "step",
    receiveTask: "step",
    scriptTask: "step",
    sendTask: "step",
    serviceTask: "step",
    userTask: "step",
    task: "step",
    
    endEvent: "step",
    startEvent: "step",
    
    // event
    implicitThrowEvent: "event",
    intermediateCatchEvent: "event",
    intermediateThrowEvent: "event",
    boundaryEvent: "event",
    event: "event",
    
    // extra
    dataObject: "data",
    dataObjectReference: "data",
    dataStoreReference: "data",
    
    callChoreography: "choreography",
    subChoreography: "choreography",
    choreographyTask: "choreography"
  }

  function NodeRepr(type) { 
    this.repType = type;
  };
  NodeRepr.prototype = new Object();
  
  var process = function(node, procRep) { 
    for( var c = (node.childNodes.length-1); c >= 0; --c ) {
      if( node.childNodes[c].prefix == bpmn2Prefix && node.childNodes[c].nodeType == 1 ) { 
        var child = node.childNodes[c];

        var nodeRep = new NodeRepr(child.localName);
        for( var a = (child.attributes.length-1); a >= 0; --a ) {  
          var attr = child.attributes[a]; 
          nodeRep[attr.localName] = attr.value;
          if( attr.prefix != bpmn2Prefix ) { 
            // DELETE field? nodeRep[attr.localName]
            throw new Perror( "The " + attr.localName + " (" + attr.prefix + " namespace) on element " + child.localName );
          }
        }
        if( nodeRep["id"] == null ) { 
          // DEBUG
          throw new Error( "An id attribute is required for element " + child.localName );
        }
        console.log( "- " + nodeRep.repType );
        for( var p in nodeRep ) { 
          console.log( " [" + p + "] " + nodeRep[p] );
        }
        var typeMap = procRep[elementCategory[nodeRep.repType]];
        typeMap[nodeRep.id] = nodeRep;
      } 
    }
  }
  
  // ---
  // Compilation
  // ---
  var defNode = definition(node);
    
  var processRepresentation = {};

  for( var elem in elementCategory ) {
    if( processRepresentation[elementCategory[elem]] ) {
      continue;
    }
    processRepresentation[elementCategory[elem]] = {};
  }

  for( var n = (defNode.childNodes.length-1); n >= 0; --n ) {
    var child = defNode.childNodes[n];
    if( child.prefix == bpmn2Prefix && child.nodeType == 1 ) { 
      switch(child.localName) { 
        case "process":
          var procNode = process(child, processRepresentation);
          break;
        case "itemDefinition":
          break;
        case "error":
          break;
        case "signal":
          break;
        case "dataStore":
          break;
        case "escalation":
          break;
        case "message":
          break;
        case "resource":
          break;
        case "interface":
          break;
        default: 
          throw new Perror("Root-level '" + child.localName + "' elements");
      }
    }
  }
  
  // return process instance (array)
  return processRepresentation;  
}

var optimize = function(procRepr) { 
  return procRepr;
}

var compileInstance = function(procRepr) { 
  return procRepr;
}

var procRepr = createRepresentation(xmlDoc);
var optimizedProcRepr = optimize(procRepr);
var instance = compileInstance(optimizedProcRepr);

console.log("===");
console.log("");
