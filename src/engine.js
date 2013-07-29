
if( typeof runme == 'undefined' ) { 
  var runme = {};
}

runme.runProcess = function(process, defInst) { 

  function Context(execBranchFunction) { 
    this.execBranch = execBranchFunction;
    this.log = function(msg) { 
      runme.log(msg);
    }
  }

  var executeSequence = funciont(inst) { 
    var inst = process.inst;
    for( var a = 0; a < inst.length; ++a ) { 
      // * context pre-processing: 
      // ??
  
      inst[a].execute(context);
  
      // * context post-processing: 
      // ??
  
      // persistence? 
    }

    return inst[inst.length-1];
  }

  var executeBranch = function(node, context) { 
    node.execute(context);
  }

  // TODO: create a context specific object? 
  var context = new Context(this.executeBranch);

  var branches = [];
  branches.push(process.inst);
  while( branches.length > 0 ) { 
    var branchSeq = branches.shift();
    var endBranch = executeSequence(branchSeq);
    if( endBranch != null ) { 
      for( b = endBranch.branches.length-1; b >= 0; --b ) { 
        branches.push( endBranch.branches[b] );
      }
    }
  }

};

