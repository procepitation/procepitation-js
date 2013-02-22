module("[Representation]");

test( "Inclusive Gateway: condition diverging test", function() {
  var xmlDoc = loadAndParse("bpmn/gateway/InclusiveGatewayTest.testDivergingInclusiveGateway.bpmn20.xml");
  var procRep = compiler.createRep(xmlDoc).process[0];
  
  ok( procRep != null, "non-null process representation" );
  var x = 7; ok( procRep.seq.length == x, procRep.seq.length + " ? " + x + " seqence");
  x = false;
  for( var i = 0; i < procRep.seq.length; ++i ) { 
    if( procRep.seq[i]["condition"] && procRep.seq[i]["condition"]["#data"] ) { 
      x = true; 
    }
  }
  ok( x, "sequence flow condition expression not filled.");
  var l = 0; for( i in procRep.nodes ) { ++l; }
  x = 6; ok( l == x, l + " ? " + x + " nodes")
});

