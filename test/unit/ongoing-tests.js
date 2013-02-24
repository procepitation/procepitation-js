module("[Representation]");

test( "Double Nested SubProcess: basic test", function() {
  var xmlDoc = loadAndParse("bpmn/subprocess/SubProcessTest.testDoubleNestedSimpleSubProcess.bpmn20.xml");
  var procRep = compiler.createRep(xmlDoc).process[0];
  
  ok( procRep != null, "non-null process representation" );
});

