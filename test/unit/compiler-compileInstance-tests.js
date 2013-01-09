
test( "Minimal Process: instance: test", function() {
  var bpmn2File = "bpmn/MinimalProcess.bpmn20.xml";
    
  var xmlDoc = loadAndParse(bpmn2File);
  var procRep = compiler.createRep(xmlDoc);
  var inst = compiler.compileInstance(procRep);
  
  ok( inst != null, "non-null process instance" );
  ok( inst.start, "non-nuill start node array" );
  ok( inst.start[0].beg == "_1", "correct start node" );
  ok( inst.start[0].next, "node stairway started." );
  ok( inst.start[0].end == inst.start[0].next[0].beg, "correct link between 2 nodes" );
});

test( "Minimal Process: instance: backwards test", function() {
  var bpmn2File = "bpmn/MinimalProcess.bpmn20.xml"
  
  var xmlDoc = loadAndParse(bpmn2File);
  var procRep = compiler.createRep(xmlDoc);
  var tmp = procRep.seq[0]; 
  procRep.seq[0] = procRep.seq[1];
  procRep.seq[1] = tmp;
  var inst = compiler.compileInstance(procRep);
  
  ok( inst != null, "non-null process instance" );
  ok( inst.start, "non-nuill start node array" );
  ok( inst.start[0].beg == "_1", "correct start node" );
  ok( inst.start[0].next, "node stairway started." );
  ok( inst.start[0].end == inst.start[0].next[0].beg, "correct link between 2 nodes" );
});

test( "Nested Fork/Join: instance: test", function() {
  var bpmn2File = "bpmn/gateway/ParallelGatewayTest.testNestedForkJoin.bpmn20.xml";
  
  var xmlDoc = loadAndParse(bpmn2File);
  var procRep = compiler.createRep(xmlDoc);
  var inst = compiler.compileInstance(procRep);
  
  ok( inst != null, "non-null process instance" );
  ok( inst.start, "non-nuill start node array" );
  ok( inst.start.length == 1, "only one start node");
  
  helper.postForkAndPreMergeTest(inst.start[0]);
});

test( "Nested Fork/Join: instance: random sequence test", function() {
  var bpmn2File = "bpmn/gateway/ParallelGatewayTest.testNestedForkJoin.bpmn20.xml";
  
  var xmlDoc = loadAndParse(bpmn2File);
  var procRep = compiler.createRep(xmlDoc);
  procRep.seq = helper.reorderArray(procRep.seq);
  var inst = compiler.compileInstance(procRep);
  
  ok( inst != null, "non-null process instance" );
  ok( inst.start, "non-nuill start node array" );
  ok( inst.start.length == 1, "only one start node");
  
  helper.postForkAndPreMergeTest(inst.start[0]);
});