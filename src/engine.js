
if( typeof runme == 'undefined' ) { 
  var runme = {};
}

runme.run = function(defInst) { 

  var p = defInst.process.length;

  // TODO: create a context specific object? 
  var context = {};

  while( --p >= 0 ) { 
    if( p < defInst.process.length-1 ) { 
      throw new UnsupError( "Multiple processes in a definition instance" );
    }

    var process = defInst.process[p];

    var i = process.length;
    while( --i >= 0 ) { 
      // * context pre-processing: 
      // ??

      context = process[i].run(context);

      // * context post-processing: 
      // ??

      // persistence? 

    }
  }

];

