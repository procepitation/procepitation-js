module("[Representation]");

test( "Start to End: basic test", function() {
  expect(3);

  var xmlDoc = loadAndParse("bpmn/StartToEnd.bpmn20.xml");
  var procRep = (compiler.createRep(xmlDoc)).process[0];
  
  notEqual( procRep, null, "non-null process representation" );
  var x = 1; equal( procRep.seq.length, x, procRep.seq.length + " ? x seqence");
  var l = 0; for( i in procRep.nodes ) { ++l; }
  x = 2; equal( l, x, l + " ? x nodes")
});

test( "Inclusive Gateway: condition diverging test", function() {
  var xmlDoc = loadAndParse("bpmn/gateway/InclusiveGatewayTest.testDivergingInclusiveGateway.bpmn20.xml");
  var procRep = compiler.createRep(xmlDoc).process[0];
  
  notEqual( procRep, null, "non-null process representation" );
  var x = 7; equal( procRep.seq.length, x, procRep.seq.length + " ? " + x + " seqence");
  x = 0;
  for( var i = 0; i < procRep.seq.length; ++i ) { 
    if( procRep.seq[i]["condition"] && /\S/.test(procRep.seq[i]["condition"])  ) { 
      ++x;
    }
  }
  equal( x, 3, "sequence flow condition expression not filled for all 3 conditions");
  var l = 0; for( i in procRep.nodes ) { ++l; }
  x = 6; equal( l, x, l + " ? " + x + " nodes")
});

test( "Double Nested SubProcess: basic test", function() {
  var xmlDoc = loadAndParse("bpmn/subprocess/SubProcessTest.testDoubleNestedSimpleSubProcess.bpmn20.xml");
  var procRep = compiler.createRep(xmlDoc).process[0];
  
  ok( procRep != null, "non-null process representation" );
});

test( "Inclusive Gateway: representation: loop test", function() {
  var xmlDoc = loadAndParse("bpmn/gateway/InclusiveGatewayTest.testLoop.bpmn20.xml");
  var procRep = compiler.createRep(xmlDoc).process[0];
  
  ok( procRep != null, "non-null process representation" );
  var x = 10; ok( procRep.seq.length == x, procRep.seq.length + " ? x seqence");
  var l = 0; for( i in procRep.nodes ) { ++l; }
  x = 8; ok( l == x, l + " ? " + x + " nodes")
  
  var inst = compiler.compileInstance(procRep);
  
  ok( inst != null, "non-null process instance" );
  ok( inst.start, "non-nuill start node array" );
  ok( inst.start.length == 3, inst.start.length + " ? 3 start nodes");
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

module("[Instance]");

test( "Minimal Process: basic test", function() {
  expect(9);

  var bpmn2File = "bpmn/MinimalProcess.bpmn20.xml";
    
  var xmlDoc = loadAndParse(bpmn2File);
  var procRep = compiler.createRep(xmlDoc).process[0];
  
  notEqual( procRep, null, "non-null process representation" );
  var x = 2; equal( procRep.seq.length, x, procRep.seq.length + " ? x seqence");
  var l = 0; for( i in procRep.nodes ) { ++l; }
  x = 3; equal( l, x, l + " ? " + x + " nodes")
  var e = "terminateEventDefinition"
  ok( procRep.nodes["_3"][e], e + " exists");
 
  var inst = compiler.compileInstance(procRep);
  
  ok( inst != null, "non-null process instance" );
  ok( inst.start, "non-nuill start node array" );
  ok( inst.start[0].beg == "_1", "correct start node" );
  ok( inst.start[0].next, "node stairway started." );
  ok( inst.start[0].end == inst.start[0].next[0].beg, "correct link between 2 nodes" );
});

test( "Minimal Process: backwards test", function() {
  expect(5);

  var bpmn2File = "bpmn/MinimalProcess.bpmn20.xml"
  
  var xmlDoc = loadAndParse(bpmn2File);
  var procRep = compiler.createRep(xmlDoc).process[0];
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

test( "Nested Fork/Join: test", function() {
  var bpmn2File = "bpmn/gateway/ParallelGatewayTest.testNestedForkJoin.bpmn20.xml";
  
  var xmlDoc = loadAndParse(bpmn2File);
  var procRep = compiler.createRep(xmlDoc).process[0];
  
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

test( "Nested Fork/Join: random sequence test", function() {
  var bpmn2File = "bpmn/gateway/ParallelGatewayTest.testNestedForkJoin.bpmn20.xml";
  
  var xmlDoc = loadAndParse(bpmn2File);
  var procRep = compiler.createRep(xmlDoc).process[0];
  procRep.seq = helper.reorderArray(procRep.seq);

  var inst = compiler.compileInstance(procRep);
  
  ok( inst != null, "non-null process instance" );
  ok( inst.start, "non-nuill start node array" );
  ok( inst.start.length == 1, "only one start node [" + inst.start.length + "]" );
  
  ok( helper.postForkAndPreMergeTest(inst, "End" ), "Recursive postFork, preMerge and 'End' test" );
});

