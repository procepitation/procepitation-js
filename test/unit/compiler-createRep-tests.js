
test( "Start-to-End  compilation test", function() {
  var xmlDoc = loadAndParse("bpmn/StartToEnd.bpmn20.xml");
  var procRep = compiler.createRep(xmlDoc);
  ok( procRep != null, "non-null process representation" );
  ok( procRep.seq.length == 1, procRep.seq.length + " ? 1 seqence")
  var l = 0; for( i in procRep.step ) { ++l; }
  ok( l == 2, l + " ? 2 steps")
});

test( "MinimalProcess compilation test", function() {
  var xmlDoc = loadAndParse("bpmn/MinimalProcess.bpmn20.xml");
  var procRep = compiler.createRep(xmlDoc);
  ok( procRep != null, "non-null process representation" );
  ok( procRep.seq.length == 2, procRep.seq.length + " ? " + 2 + " seqence")
  var l = 0; for( i in procRep.step ) { ++l; } 
  ok( l == 3, l + " ? " + 3 + " steps");
  var e = "terminateEventDefinition"
  ok( procRep.step["_3"][e], e );
});