// compilerScratch

function start() { 
  console.log("===");
  console.log( "- " + new Date().toLocaleTimeString());
  console.log("");
};

start();

var bpmn2File = "bpmn/gateway/ParallelGatewayTest.testNestedForkJoin.bpmn20.xml";
bpmn2File = "bpmn/MinimalProcess.bpmn20.xml";

var xmlDoc = loadAndParse(bpmn2File);
var procRep = compiler.createRep(xmlDoc);

compiler.compileInstance(procRep);


// -------

function Node(myType) { 
  this.type = myType; 
};

function ScriptNode(myScript) { 
  this.type = map.script;
  this.script = myScript;
}
ScriptNode.prototype = new Node();

var repTypeNode = { 
  endEvent: Node,
  startEvent: Node
}