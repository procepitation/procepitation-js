
if( typeof runme == 'undefined' ) { 
  var runme = {};
}

  // ----
  // COMPILE INSTANCE (ON THE BASIS OF THE INTERMEDIATE GRAPH REP)
  // ----
 
runme.compileInstance = function(thisDefRep) { 

    function UnsupError(element) { 
      this.message = element + " is/are not yet supported.";
    };
    UnsupError.prototype = new Error();

    var compileProcessInstance = function(procRep, wholeDefRep) { 

      if( procRep.graph.start.length > 1 ) {  
        // FIXME: eventually supported!!
        throw new UnsupError( "Multiple start nodes" );
      }

      var arrayBegin = [procRep.nodes[procRep.graph.start[0].beg]];
      var graphResult = traverseBranch(procRep.graph.start[0], procRep.nodes, arrayBegin);
      procRep.inst = graphResult.candyString;

      // delete procRep.nodes; // FIXME: after debug, put back in
      // delete procRep.graph; // FIXME: once we know for sure

    }

    var visited = {};

    /**
     * Takes as it's arguments: 
     * - a [seq] object generated by createGraph
     * - the [nodes] map that is a {id => node} map
     *   - The node in the map is the functional process step node
     * - a [thisBranch] array thatl, at the top level, the array 
     *   of the process instance is. When called recursively, this array
     *   represents the local branch. It's an "extended" fork branch. 
     */
    // context object parameter? for index, etc? 
    var traverseBranch = function(seq, nodes, thisBranch) { 
      var result = { 
        candyString : thisBranch,
        nextSeq : seq
      }

      while( seq != null ) { 
        if( visited[seq.end] ) { 
          break; 
        }

        // add nodes[seq.end] to thisBranch
        var thisNode = nodes[seq.end]
        thisBranch.push(thisNode);
        visited[seq.end] = true;

        switch(seq.next.length) {
          case 0:
            seq = null;
            result.nextSeq = null;
            break;
          case 1:
            seq = seq.next[0];
            result.nextSeq = seq;
            break;
          default: 
            var forkResult = traverseFork(thisNode, seq.next, nodes);
            result.nextSeq = forkResult.nextSeq;
            seq = forkResult.nextSeq;
        }
      }

      return result;
    }

    var traverseFork = function(thisNode, forkSeqs, nodes) { 
      var forksBranch = [];
      var forkResult = { 
        candyString : forksBranch,
        nextSeq : null
      }

      while( forkSeqs != null ) { 
        // Go through branches
        var nextSeqs = [];
        var f = forkSeqs.length;
        while( --f >= 0 ) { 
          var branchResult = traverseBranch(forkSeqs[f], nodes, []);
          var newBranch = branchResult.candyString;
          // 1. add branch info to gateway node
          thisNode.branches.push(
            [forksBranch.length, 
             forksBranch.length + newBranch.length]
          );
          // 2. add newBranch to existing candy string
          var nbi = 0; 
          for( ; nbi < newBranch.length; ++nbi ) { 
            forksBranch.push(newBranch[nbi]);
          }
          // 3. save branch.nextSeq 
          if( branchResult.nextSeq != null ) { 
            nextSeqs.push( branchResult.nextSeq );
          }
        }
  
        // Determine next seq
        if( nextSeqs.length == 0 ) { 
          forkSeqs = null;
        } else { 
          var ns = nextSeqs.length-1;
          var newSeq = nextSeqs[ns];
          while( --ns >= 0 ) { 
            // DEBUG? 
            if( newSeq.end != nextSeqs[ns].end ) { 
              throw new Error( newSeq.beg + "/" + newSeq.end + " != " 
                               + nextSeqs[ns].beg + "/" + nextSeqs[ns].end );
            }
          }
  
          // Add node where branches merged
          thisNode = nodes[newSeq.end];
          forksBranch.push(thisNode);
   
          // Are we immediately reforking? 
          switch(newSeq.next.length) { 
            case 1:
              forkResult.nextSeq = newSeq.next[0];
            case 0:
              forkSeqs = null;
              break;
            default: 
              forkSeqs = newSeq.next;
          } 
        }
      }
      
      return forkResult;
    }

    var i = thisDefRep.process.length;
    while( --i >= 0 ) { 
      compileProcessInstance(thisDefRep.process[i], thisDefRep);
      if( i < thisDefRep.process.length-1 ) { 
        throw new UnsupError( "Multiple (sub-)processes" );
      }
    }

    return thisDefRep;
}
