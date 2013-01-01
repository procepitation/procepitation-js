/*
 * Dit is een JavaScript-kladblok.
 *
 * Voer wat JavaScript in en klik met de rechtermuisknop of kies in het menu Uitvoeren:
 * 1. Uitvoeren om de geselecteerde tekst te evalueren (Ctrl+R),
 * 2. Inspecteren om een Object Inspector op het resultaat te tonen (Ctrl+I), of
 * 3. Weergeven om het resultaat in een opmerking na de selectie in te voeren. (Ctrl+L)
 */

console.log( "");
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

// -=------------------

function Perror(msg) { 
    this.message = msg;
}
Perror.prototype = new Error();

var showDeep = function(lvl, node) { 

  var ind = "";
  for( var i = 0; i < lvl; ++i ) { 
    ind += "  ";
  }

  if( node.nodeType == 1 ) {
      if( node.localName != "BPMNDiagram" ) { 
        console.log( ind + "n: " + node.localName );
      } else { 
        return;
      }
  } else if( node.nodeType == 3 ) { 
    if( /[^\s]/.test(node.data) ) { 
      console.log( ind + "n: " + node.nodeName + " [" + node.data + "]" );
    }
  }  else { 
      console.log( ind + "n: " + node.localName + " [" + node.nodeType + "]" );
  }
  
  ind += "a";
  if( node.attributes !== undefined && node.attributes != null ) { 
    for( var i = 0; i < node.attributes.length; ++i ) { 
      var attr = node.attributes[i];
      console.log( ind + "[" + i + "] (" + attr.prefix + ") " + attr.localName + " : " + attr.value );
    } 
  }
  
  if( node.childNodes !== undefined ) { 
    for( var i = 0; i <  node.childNodes.length; ++i ) { 
      showDeep( lvl + 1, node.childNodes[i] )
    }
  }
}

// showDeep( 0, xmlDoc );

var schema = new Object();
var bpmn2Prefix = null;
var bpmn2SchemaRE = new RegExp( "http://www.omg.org/spec/BPMN/201\\d+/MODEL" );

var compile = function( node ) { 
    for( var i = 0; i <  node.childNodes.length; ++i ) { 
       var child = node.childNodes[i];
       console.log( "n: (" + child.prefix + ") " + child.localName + " [" + child.nodeType + "]" );
       for( var i = 0; i < child.attributes.length; ++i ) { 
         var attr = child.attributes[i];
         console.log( "[" + i + "] (" + attr.prefix + ") " + attr.localName + " : " + attr.value );
       } 
    }
    return null;
}


var definition = function( node ) { 
  if( node.localName != "definition" ) { 
    throw new Perror( "element local name is " + node.localName + "; expected 'definition'" );
  } 
  for( var i = 0; i < child.attributes.length; ++i ) { 
    var attr = child.attributes[i];
    if( /^xmlns$/i.test( attr.localName ) ) { 
      schema[attr.prefix] = attr.value;
      if( bpmn2SchemaRE.test(attr.value) ) { 
        bpmn2Prefix = attr.prefix;
      }  
    }    
  }  
}

var instance = compile( xmlDoc );

// -----------


var nodeAccept = [
  NodeFilter.FILTER_REJECT, // NO type 0!!
  NodeFilter.FILTER_ACCEPT, // 1: element 
  NodeFilter.FILTER_ACCEPT, // attribute
  NodeFilter.FILTER_ACCEPT, // text
  NodeFilter.FILTER_ACCEPT, // CDATA 
  NodeFilter.FILTER_ACCEPT, // 5: entity reference 
  NodeFilter.FILTER_ACCEPT, // entity 
  NodeFilter.FILTER_REJECT, // processing instruction 
  NodeFilter.FILTER_ACCEPT, // element 
  NodeFilter.FILTER_ACCEPT, // 9: document 
  NodeFilter.FILTER_ACCEPT, // document type
  NodeFilter.FILTER_ACCEPT, // document fragment
  NodeFilter.FILTER_ACCEPT, // notation
];
  
var nodeFilter = function(node) { 
  if( node.nodeType == 1 && node.localName == "BPMNDiagram" ) { 
    return NodeFilter.FILTER_REJECT;
  }
  return nodeAccept[node.nodeType];
}

/*
Exception: perror is not defined
@Scratchpad:43
*/