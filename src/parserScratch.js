/*
 * Dit is een JavaScript-kladblok.
 *
 * Voer wat JavaScript in en klik met de rechtermuisknop of kies in het menu Uitvoeren:
 * 1. Uitvoeren om de geselecteerde tekst te evalueren (Ctrl+R),
 * 2. Inspecteren om een Object Inspector op het resultaat te tonen (Ctrl+I), of
 * 3. Weergeven om het resultaat in een opmerking na de selectie in te voeren. (Ctrl+L)
 */

console.log( "----------------" );

// var bpmn2File = "MultiThreadServiceProcess.bpmn2";
var bpmn2File = "Xml-Parsing-one.bpmn2";

if (window.XMLHttpRequest)  {
  // code for IE7+, Firefox, Chrome, Opera, Safari
  xmlhttp=new XMLHttpRequest();
} else {
  // code for IE6, IE5
  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
}

xmlhttp.open("GET",bpmn2File,false);
xmlhttp.send();
bpmn2Txt = xmlhttp.responseText;

if (window.DOMParser) {
  parser=new DOMParser();
  xmlDoc=parser.parseFromString(bpmn2Txt,"text/xml");
} else {
  // Internet Explorer
  xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
  xmlDoc.async=false;
  xmlDoc.loadXML(bpmn2Txt); 
}

// =====
// BASE TYPES
// =====

function Perror(msg) { 
    this.message = msg;
}
Perror.prototype = new Error();

// ----
// COMPILATION
// ----

var compile = function(node) { 

  var schema = new Object();
  var bpmn2Prefix = null;
  var bpmn2SchemaRE = new RegExp( "http://www.omg.org/spec/BPMN/201\\d+/MODEL" );

  // ---
  // Functions
  // ---
  var definition = function(node) {
    var nodeName = "definitions";
    for( var i = 0; i < node.childNodes.length; ++i ) { 
      var child = node.childNodes[i];
      if( child.nodeType == 1 && child.localName == nodeName ) { 
        node = child;
      }
    }
    if( node.localName != nodeName ) { 
      throw new Perror( "element local name is " + node.localName + "; expected '" + nodeName + "'" );
    } 
    for( var i = 0; i < node.attributes.length; ++i ) { 
      var attr = node.attributes[i];
      if( /^xmlns$/i.test( attr.prefix ) ) { 
        schema[attr.localName] = attr.value;
        if( bpmn2SchemaRE.test(attr.value) ) { 
          bpmn2Prefix = attr.localName;
        }  
      } 
    }
    return node;
  }

    var processNode = { 
      adHocSubProcess: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      boundaryEvent: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      businessRuleTask: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      callActivity: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      callChoreography: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      choreographyTask: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      complexGateway: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      dataObject: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      dataObjectReference: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      dataStoreReference: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      endEvent: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      event: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      eventBasedGateway: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      exclusiveGateway: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      implicitThrowEvent: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      inclusiveGateway: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      intermediateCatchEvent: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      intermediateThrowEvent: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      manualTask: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      parallelGateway: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      receiveTask: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      scriptTask: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      sendTask: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      sequenceFlow: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      serviceTask: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      startEvent: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      subChoreography: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      subProcess: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      task: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      transaction: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
      userTask: function(node) { 
        throw new Perror(node.localName + " is not yet supported.");
      },
    };

  var process = function(node) { 
    for( var i = 0; i < node.childNodes.length; ++i ) { 
      if( node.childNodes[i].prefix == bpmn2Prefix && node.childNodes[i].nodeType == 1 ) { 
        var child = node.childNodes[i];     
        console.log( child.localName );
        processNode[child.localName](child);    
      }
    }
  }
  
  // ---
  // Compilation
  // ---
  var defNode = definition(node);

  for( var i = 0; i < defNode.childNodes.length; ++i ) {
    var child = defNode.childNodes[i];
    if( child.prefix == bpmn2Prefix && child.nodeType == 1 ) { 
      switch(child.localName) { 
        case "process":
          var procNode = process(child);
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
          throw new Perror("Root-level '" + child.localName + "' elements are not supported.");
      }
    }
  }
  
  // return process instance (array)
  return null;  
}

var instance = compile( xmlDoc );

console.log("===");
console.log("");