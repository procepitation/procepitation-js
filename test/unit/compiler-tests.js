module("[Representation]");

test( "Start to End: basic test", function() {
  expect(3);

  var xmlDoc = loadAndParse("bpmn/StartToEnd.bpmn20.xml");
  var procRep = (runme.createRep(xmlDoc)).process[0];
  
  notEqual( procRep, null, "non-null process representation" );
  equal( procRep.seq.length, 1, "all sequences should be stored" );
  var l = 0; for( i in procRep.nodes ) { ++l; }
  equal( l, 2, "all nodes should be stored" );
});

test( "Inclusive Gateway: condition diverging test", function() {
  expect(4);
  
  var xmlDoc = loadAndParse("bpmn/gateway/InclusiveGatewayTest.testDivergingInclusiveGateway.bpmn20.xml");
  var procRep = runme.createRep(xmlDoc).process[0];
  
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
  var procRep = runme.createRep(xmlDoc).process[0];
  
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
  expect(11);

  var bpmn2File = "bpmn/MinimalProcess.bpmn20.xml";
    
  var xmlDoc = loadAndParse(bpmn2File);
  var defRep = runme.createRep(xmlDoc);
  var procRep = defRep.process[0];
 
  // 5 tests
  notEqual( procRep, null, "non-null process representation" );
  equal( procRep.seq.length, 2, "testing procRep.seq array length" );
  var l = 0; for( i in procRep.nodes ) { ++l; }
  equal( l, 3, "testing number of elements in procRep.nodes" );
  var e = "terminateEventDefinition"
  notEqual( procRep.nodes["_3"].events, null, ".events array exists in end node rep");
  ok( procRep.nodes["_3"].events[0] != null && procRep.nodes["_3"].events[0].type == "terminate", 
      "terminate event definition added to end node" );
 
  defRep = runme.createGraph(defRep);
  
  // 6 tests
  notEqual( defRep, null, "non-null definition representation" );
  ok( typeof defRep.process !== "undefined" && defRep.process.length > 0, 
      "non-empty process array field" );
  var graph = defRep.process[0].graph;
  notEqual( graph.start, null, "non-null start node array" );
  equal( graph.start[0].beg,  "_1", "correct start node" );
  notEqual( graph.start[0].next, null, "node stairway started." );
  equal( graph.start[0].end, graph.start[0].next[0].beg, "correct link between 2 nodes" );
});

test( "Minimal Process: backwards test", function() {
  expect(5);

  var bpmn2File = "bpmn/MinimalProcess.bpmn20.xml"
  
  var xmlDoc = loadAndParse(bpmn2File);
  var defRep = runme.createRep(xmlDoc);
  var procRep = defRep.process[0];
  
  var tmp = procRep.seq[0]; 
  procRep.seq[0] = procRep.seq[1];
  procRep.seq[1] = tmp;
  
  var inst = runme.createGraph(defRep);
  
  notEqual( defRep, null, "non-null definition representation" );
  ok( typeof defRep.process !== "undefined" && defRep.process.length > 0, 
      "non-empty process array field" );
  var graph = defRep.process[0].graph;
  equal( graph.start[0].beg,  "_1", "correct start node" );
  notEqual( typeof graph.start[0].next, "undefined", "node stairway exists." );
  equal( graph.start[0].end, graph.start[0].next[0].beg, "correct link between 2 nodes" );
});

test( "Inclusive Gateway: representation: loop test", function() {
  expect(8);
  
  var xmlDoc = loadAndParse("bpmn/gateway/InclusiveGatewayTest.testLoop.bpmn20.xml");
  var defRep = runme.createRep(xmlDoc);
  var procRep = defRep.process[0];
  
  notEqual( procRep, null, "non-null process representation" );
  var x = 10; equal( procRep.seq.length, x, "all sequences should be stored" );
  var l = 0; for( i in procRep.nodes ) { ++l; }
  equal( l, 8, "number of elements in procRep.nodes" );
  
  var inst = runme.createGraph(defRep);
  
  notEqual( defRep, null, "non-null definition representation" );
  ok( typeof defRep.process !== "undefined" && defRep.process.length > 0, 
      "non-empty process array field" );
  var graph = defRep.process[0].graph;
  equal( graph.start.length, 3, "there should be 3 start nodes" );
  var x = ""; var startName = "theStart";
  for( var i = 0; i < graph.start.length; ++i ) {
    if( graph.start[i].beg != startName ) { 
      x = i;
    }
  }
  var badStart = startName;
  if( x != "" ) { 
    badStart = graph.start[x].beg; 
  }
  equal( x, "", "Start node [" + x + "] should be '" + startName + "' [not " + badStart + "]" );
 
  var endName = "theEnd"
  ok( helper.postForkAndPreMergeTest(graph, endName ), "Recursive postFork, preMerge and 'End' test" );
});

test( "Nested Fork/Join: test", function() {
  expect(8);
  
  var xmlDoc = loadAndParse("bpmn/gateway/ParallelGatewayTest.testNestedForkJoin.bpmn20.xml");
  var defRep = runme.createRep(xmlDoc);
  var procRep = defRep.process[0];
  
  notEqual( procRep, null, "non-null process representation" );
  equal( procRep.seq.length, 13, "testing procRep.seq array length" );
  var l = 0; for( i in procRep.nodes ) { ++l; }
  equal( l, 12, "number of elements in procRep.nodes" );
  
  var inst = runme.createGraph(defRep);
  
  notEqual( defRep, null, "non-null definition representation" );
  ok( typeof defRep.process !== "undefined" && defRep.process.length > 0, 
      "non-empty process array field" );
  var graph = defRep.process[0].graph;
  ok( typeof graph.start !== "undefined", "non-null start node array" );
  equal( graph.start.length, 1, "only one start node");
  
  ok( helper.postForkAndPreMergeTest(graph, "End" ), "Recursive postFork, preMerge and 'End' test" );
});

test( "Nested Fork/Join: random sequence test", function() {
  expect(5);
  
  var xmlDoc = loadAndParse("bpmn/gateway/ParallelGatewayTest.testNestedForkJoin.bpmn20.xml");
  var defRep = runme.createRep(xmlDoc);
  var procRep = defRep.process[0];
  
  // reorder process definition
  procRep.seq = helper.reorderArray(procRep.seq);

  var inst = runme.createGraph(defRep);
  
  notEqual( typeof defRep, "undefined", "non-null definition representation" );
  ok( typeof defRep.process !== "undefined" && defRep.process.length > 0, 
      "non-empty process array field" );
  var graph = defRep.process[0].graph;
  notEqual( typeof graph.start, "undefined", "non-null start node array" );
  equal( graph.start.length, 1, "only one start node [" + graph.start.length + "]" );
  
  ok( helper.postForkAndPreMergeTest( graph, "End" ), "Recursive postFork, preMerge and 'End' test" );
});

module("[Engine]");

test( "Minimal Process: basic test", function() {
  expect(0);

  var bpmn2File = "bpmn/MinimalProcess.bpmn20.xml";
    
  var xmlDoc = loadAndParse(bpmn2File);
  var procInst = runme.compile(xmlDoc);

  runme.run(procInst);
});