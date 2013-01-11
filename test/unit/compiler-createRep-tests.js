
test( "Inclusive Gateway: representation: condition diverging test", function() {
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

test( "Double Nested SubProcess: representation: test", function() {
  var xmlDoc = loadAndParse("bpmn/subprocess/SubProcessTest.testDoubleNestedSimpleSubProcess.bpmn20.xml");
  var procRep = compiler.createRep(xmlDoc);
  
  ok( procRep != null, "non-null process representation" );
});