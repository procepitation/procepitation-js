module("[Representation]");

test( "Start to End: basic test", function() {
  expect(3);

  var xmlDoc = loadAndParse("bpmn/StartToEnd.bpmn20.xml");
  var procRep = (compiler.createRep(xmlDoc)).process[0];
  
  notEqual( procRep, null, "non-null process representation" );
  equal( procRep.seq.length, 1, "all sequences should be stored" );
  var l = 0; for( i in procRep.nodes ) { ++l; }
  equal( l, 2, "all nodes should be stored" );
});

test( "Inclusive Gateway: condition diverging test", function() {
  expect(4);
  
  var xmlDoc = loadAndParse("bpmn/gateway/InclusiveGatewayTest.testDivergingInclusiveGateway.bpmn20.xml");
  var procRep = compiler.createRep(xmlDoc).process[0];
  
  notEqual( procRep, null, "non-null process representation" );
  equal( procRep.seq.length, 7, "all sequences should be stored" );
  var l = 0; for( i in procRep.nodes ) { ++l; }
  equal( l, 6, l + "all nodes should be stored" );
  
  var x = 0;
  for( var i = 0; i < procRep.seq.length; ++i ) { 
    if( procRep.seq[i]["condition"] && /\S/.test(procRep.seq[i]["condition"])  ) { 
      ++x;
    }
  }
  equal( x, 3, "sequence flow condition expression not filled for all conditions");
});

test( "Double Nested SubProcess: basic test", function() {
  expect(4);
  
  var xmlDoc = loadAndParse("bpmn/subprocess/SubProcessTest.testDoubleNestedSimpleSubProcess.bpmn20.xml");
  var procRep = compiler.createRep(xmlDoc).process[0];
  
  notEqual( procRep, null, "non-null process representation" );
  var first = procRep.nodes["firstSubProcess"];
  notEqual( first.seq, null, "seq field present for subprocess" );
  var second = first.nodes["secondSubProcess"];
  notEqual( second.seq, null, "seq field present for nested subprocess" );
  var third = second.nodes["thirdSubProcess"];
  notEqual( third.seq, null, "seq field present for doubly nested subprocess" );
});

module("[Instance]");

test( "Minimal Process: basic test", function() {
  expect(10);

  var bpmn2File = "bpmn/MinimalProcess.bpmn20.xml";
    
  var xmlDoc = loadAndParse(bpmn2File);
  var procRep = compiler.createRep(xmlDoc).process[0];
 
  // 5 tests
  notEqual( procRep, null, "non-null process representation" );
  equal( procRep.seq.length, 2, "testing procRep.seq array length" );
  var l = 0; for( i in procRep.nodes ) { ++l; }
  equal( l, 3, "testing number of elements in procRep.nodes" );
  var e = "terminateEventDefinition"
  notEqual( procRep.nodes["_3"].events, null, ".events array exists in end node rep");
  ok( procRep.nodes["_3"].events[0] != null && procRep.nodes["_3"].events[0].type == "terminate", 
      "terminate event definition added to end node" );
 
  var inst = compiler.compileInstance(procRep);
  
  // 5 tests
  notEqual( inst, null, "non-null process instance" );
  notEqual( inst.start, null, "non-null start node array" );
  equal( inst.start[0].beg,  "_1", "correct start node" );
  notEqual( inst.start[0].next, null, "node stairway started." );
  equal( inst.start[0].end, inst.start[0].next[0].beg, "correct link between 2 nodes" );
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

test( "Inclusive Gateway: representation: loop test", function() {
  var xmlDoc = loadAndParse("bpmn/gateway/InclusiveGatewayTest.testLoop.bpmn20.xml");
  var procRep = compiler.createRep(xmlDoc).process[0];
  
  notEqual( procRep, null, "non-null process representation" );
  var x = 10; equal( procRep.seq.length, x, "all sequences should be stored" );
  var l = 0; for( i in procRep.nodes ) { ++l; }
  equal( l, 8, "number of elements in procRep.nodes" );
  
  var inst = compiler.compileInstance(procRep);
  
  notEqual( inst, null, "non-null process instance" );
  notEqual( inst.start, null, "non-nuill start node array" );
  equal( inst.start.length, 3, "there should be 3 start nodes" );
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
  equal( x, "", "Start node [" + x + "] should be '" + startName + "' [not " + badStart + "]" );
 
  var endName = "theEnd"
  ok( helper.postForkAndPreMergeTest(inst, endName ), "Recursive postFork, preMerge and 'End' test" );
});

test( "Nested Fork/Join: test", function() {
  var bpmn2File = "bpmn/gateway/ParallelGatewayTest.testNestedForkJoin.bpmn20.xml";
  
  var xmlDoc = loadAndParse(bpmn2File);
  var procRep = compiler.createRep(xmlDoc).process[0];
  
  notEqual( procRep, null, "non-null process representation" );
  equal( procRep.seq.length, 13, "testing procRep.seq array length" );
  var l = 0; for( i in procRep.nodes ) { ++l; }
  equal( l, 12, "number of elements in procRep.nodes" );
  
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

