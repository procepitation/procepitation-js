
test( "Start to End: representation test", function() {
  var xmlDoc = loadAndParse("bpmn/StartToEnd.bpmn20.xml");
  var procRep = compiler.createRep(xmlDoc);
  
  ok( procRep != null, "non-null process representation" );
  var x = 1; ok( procRep.seq.length == x, procRep.seq.length + " ? x seqence");
  var l = 0; for( i in procRep.step ) { ++l; }
  x = 2; ok( l == x, l + " ? x steps")
});

test( "Minimal Process representation test", function() {
  var xmlDoc = loadAndParse("bpmn/MinimalProcess.bpmn20.xml");
  var procRep = compiler.createRep(xmlDoc);
  
  ok( procRep != null, "non-null process representation" );
  var x = 2; ok( procRep.seq.length == x, procRep.seq.length + " ? x seqence");
  var l = 0; for( i in procRep.step ) { ++l; }
  x = 3; ok( l == x, l + " ? " + x + " steps")
  var e = "terminateEventDefinition"
  ok( procRep.step["_3"][e], e );
});

test( "Parallel Gateway: nested with join representation test", function() {
  var xmlDoc = loadAndParse("bpmn/gateway/ParallelGatewayTest.testNestedForkJoin.bpmn20.xml");
  var procRep = compiler.createRep(xmlDoc);
  
  ok( procRep != null, "non-null process representation" );
  var x = 13; ok( procRep.seq.length == x, procRep.seq.length + " ? x seqence");
  var l = 0; for( i in procRep.step ) { ++l; }
  x = 12; ok( l == x, l + " ? " + x + " steps")
});

test( "Inclusive Gateway: after split representation test", function() {
  var xmlDoc = loadAndParse("bpmn/gateway/InclusiveGatewayTest.testLoop.bpmn20.xml");
  var procRep = compiler.createRep(xmlDoc);
  
  ok( procRep != null, "non-null process representation" );
  var x = 10; ok( procRep.seq.length == x, procRep.seq.length + " ? x seqence");
  var l = 0; for( i in procRep.step ) { ++l; }
  x = 8; ok( l == x, l + " ? " + x + " steps")
});

test( "Inclusive Gateway: diverging representation test", function() {
  var xmlDoc = loadAndParse("bpmn/gateway/InclusiveGatewayTest.testDivergingInclusiveGateway.bpmn20.xml");
  var procRep = compiler.createRep(xmlDoc);
  
  ok( procRep != null, "non-null process representation" );
  var x = 7; ok( procRep.seq.length == x, procRep.seq.length + " ? x seqence");
  x = false;
  for( var i = 0; i < procRep.seq.length; ++i ) { 
    if( procRep.seq[i]["conditionExpression"] && procRep.seq[i]["conditionExpression"]["#data"] ) { 
      x = true; 
    }
  }
  ok( x, "sequence flow condition expression filled.");
  var l = 0; for( i in procRep.step ) { ++l; }
  x = 6; ok( l == x, l + " ? " + x + " steps")
});

test( "Inclusive Gateway: merging representation test", function() {
  var xmlDoc = loadAndParse("bpmn/gateway/InclusiveGatewayTest.testMergingInclusiveGateway.bpmn20.xml");
  var procRep = compiler.createRep(xmlDoc);
  
  ok( procRep != null, "non-null process representation" );
  var x = 5; ok( procRep.seq.length == x, procRep.seq.length + " ? x seqence");
  var l = 0; for( i in procRep.step ) { ++l; }
  x = 4; ok( l == x, l + " ? " + x + " steps")
});

test( "Exclusive Gateway: diverging representation test", function() {
  var xmlDoc = loadAndParse("bpmn/gateway/ExclusiveGatewayTest.testDivergingExclusiveGateway.bpmn20.xml");
  var procRep = compiler.createRep(xmlDoc);
  
  ok( procRep != null, "non-null process representation" );
  var x = 7; ok( procRep.seq.length == x, procRep.seq.length + " ? x seqence");
  var l = 0; for( i in procRep.step ) { ++l; }
  x = 6; ok( l == x, l + " ? " + x + " steps")
});

/**
test( "Exclusive Gateway: merging with scripts representation test", function() {
  var bpmn2File = "bpmn/gateway/ExclusiveGatewayTest.testMergingExclusiveGatewayWithScripts.bpmn20.xml"
  console.log( "- " + bpmn2File );
  var xmlDoc = loadAndParse(bpmn2File);
  var procRep = compiler.createRep(xmlDoc);
  ok( procRep != null, "non-null process representation" );
});
*/