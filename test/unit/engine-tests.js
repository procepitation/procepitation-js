module("[Engine]");

test( "Minimal process: basic", function() {
  expect(0);
  
  var bpmn2File = "bpmn/MinimalProcess.bpmn20.xml";
  
  var xmlDoc = loadAndParse(bpmn2File);
  var defInst = runme.compile(xmlDoc);

  runme.runProcess(defInst.process[0], defInst);
});

