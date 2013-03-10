
if( typeof runme == 'undefined' ) { 
  var runme = {};
}

runme.runProcess = function(process, defInst) { 

  function Context() { 
    this.log = function(msg) { 
      runme.log(msg);
    }
  }

  // TODO: create a context specific object? 
  var context = new Context();

  var inst = process.inst;
  for( var i = 0; i < inst.length; ++i ) { 
    // * context pre-processing: 
    // ??

    inst[i](context);

    // * context post-processing: 
    // ??

    // persistence? 
  }

};

