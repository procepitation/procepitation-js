  
var loadAndParse = function(bpmn2File) { 
  if(window.XMLHttpRequest)  {
    // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  } else {
    // code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  
  xmlhttp.open("GET", bpmn2File, false);
  xmlhttp.send();
  bpmn2Txt = xmlhttp.responseText;

  if( xmlhttp.status != 200 ) { 
    throw new Error( "Unable to GET '" + bpmn2File + "': " + xmlhttp.statusText );
  }
  
  if(window.DOMParser) {
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(bpmn2Txt, "text/xml");
  } else {
    // Internet Explorer
    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async = false;
    xmlDoc.loadXML(bpmn2Txt); 
  }
  return xmlDoc;
}

