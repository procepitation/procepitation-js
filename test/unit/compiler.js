
test( "Start-to-End  compilation test", function() {
  var xmlDoc = loadAndParse("bpmn/StartToEnd.bpmn20.xml");
  var procRep = compiler.createRep(xmlDoc);
  ok( procRep != null, "Instance is not null." );
  ok( procRep.step.length = 2, "Process Rep")
});

test( "MinimalProcess compilation test", function() {
  var xmlDoc = loadAndParse("bpmn/MinimalProcess.bpmn20.xml");
  var procRep = compiler.createRep(xmlDoc);
  ok( procRep != null, "Instance is not null." );
});