
test( "Start to End: representation: test", function() {
  var xmlDoc = loadAndParse("bpmn/StartToEnd.bpmn20.xml");
  var procRep = compiler.createRep(xmlDoc);
  
  ok( procRep != null, "non-null process representation" );
  var x = 1; ok( procRep.seq.length == x, procRep.seq.length + " ? x seqence");
  var l = 0; for( i in procRep.step ) { ++l; }
  x = 2; ok( l == x, l + " ? x steps")
});

test( "Minimal Process: representation, instance: test", function() {
  var bpmn2File = "bpmn/MinimalProcess.bpmn20.xml";
    
  var xmlDoc = loadAndParse(bpmn2File);
  var procRep = compiler.createRep(xmlDoc);
  
  ok( procRep != null, "non-null process representation" );
  var x = 2; ok( procRep.seq.length == x, procRep.seq.length + " ? x seqence");
  var l = 0; for( i in procRep.step ) { ++l; }
  x = 3; ok( l == x, l + " ? " + x + " steps")
  var e = "terminateEventDefinition"
  ok( procRep.step["_3"][e], e );
  
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
  ok( inst.start[0].next, "node stairway exists." );
  ok( inst.start[0].end == inst.start[0].next[0].beg, "correct link between 2 nodes" );
});

test( "Nested Fork/Join: representation, instance: test", function() {
  var bpmn2File = "bpmn/gateway/ParallelGatewayTest.testNestedForkJoin.bpmn20.xml";
  
  var xmlDoc = loadAndParse(bpmn2File);
  var procRep = compiler.createRep(xmlDoc);
  
  ok( procRep != null, "non-null process representation" );
  var x = 13; ok( procRep.seq.length == x, procRep.seq.length + " ? x seqence");
  var l = 0; for( i in procRep.step ) { ++l; }
  x = 12; ok( l == x, l + " ? " + x + " steps")
  
  var inst = compiler.compileInstance(procRep);
  
  ok( inst != null, "non-null process instance" );
  ok( inst.start, "non-nuill start node array" );
  ok( inst.start.length == 1, "only one start node");
  
  ok( helper.postForkAndPreMergeTest(inst, "End" ), "Recursive postFork, preMerge and 'End' test" );
});

test( "Nested Fork/Join: instance: random sequence test", function() {
  var bpmn2File = "bpmn/gateway/ParallelGatewayTest.testNestedForkJoin.bpmn20.xml";
  
  var xmlDoc = loadAndParse(bpmn2File);
  var procRep = compiler.createRep(xmlDoc);
  procRep.seq = helper.reorderArray(procRep.seq);
  var graphRep = compiler.compileInstance(procRep);
  
  ok( graphRep != null, "non-null process instance" );
  ok( graphRep.start, "non-nuill start node array" );
  ok( graphRep.start.length == 1, "only one start node [" + graphRep.start.length + "]" );
  
  ok( helper.postForkAndPreMergeTest(graphRep, "End" ), "Recursive postFork, preMerge and 'End' test" );
});

test( "Inclusive Gateway: representation: loop test", function() {
  var xmlDoc = loadAndParse("bpmn/gateway/InclusiveGatewayTest.testLoop.bpmn20.xml");
  var procRep = compiler.createRep(xmlDoc);
  
  ok( procRep != null, "non-null process representation" );
  var x = 10; ok( procRep.seq.length == x, procRep.seq.length + " ? x seqence");
  var l = 0; for( i in procRep.step ) { ++l; }
  x = 8; ok( l == x, l + " ? " + x + " steps")
  
  var inst = compiler.compileInstance(procRep);
  
  ok( inst != null, "non-null process instance" );
  ok( inst.start, "non-nuill start node array" );
  ok( inst.start.length == 3, "only 3 start nodes");
  var x = ""; var startName = "theStart";
  for( var i = 0; i < inst.start.length; ++i ) {
    if( inst.start[i].beg != startName ) { 
      x = i;
    }
  }
  var badStart = startName;
  if( x != "" ) { 
    badStart = inst.start[x].beg; 
  }
  ok( x == "", "Start node [" + x + "] is not '" + startName + "' [" + badStart + "]" );
 
  var endName = "theEnd"
  ok( helper.postForkAndPreMergeTest(inst, endName ), "Recursive postFork, preMerge and 'End' test" );
});