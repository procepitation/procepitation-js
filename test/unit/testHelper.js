helper = {
    
  reorderArray: function(arr) { 
    var length = arr.length; 
    var newArr = [];
    
    var notUsed = new Object();
    for( var i = 0; i < length; ++i ) {
      notUsed["" + i] = true;
    }
    while( newArr.length < length-2 ) { 
      var rnd = Math.random();
      var next = Math.floor(rnd*length);
      if( next > length ) { 
        throw new Error( next + " > " + length );
      }
      if( notUsed["" + next] ) { 
        notUsed["" + next] = false;
        newArr.push(arr[next]);
      }
    }
    for( var i in notUsed ) {
      if( notUsed[i] ) { 
        newArr.push(arr[i]);
      }
    }
    return newArr;
  },
  
  postForkAndPreMergeTest: function(graph, end) { 
    var nodeBegsVisited = new Object();
    
    var recursivePFAndPMTest = function(node, endName) { 
      if( nodeBegsVisited[node.beg] ) { 
        return;
      }
      nodeBegsVisited[node.beg] = true;
      
      if( /^Join/.test( node.end ) ) {
        if( ! node.preMerge ) { 
          throw new Error( "preMerge for: " + node.beg + " > " + node.end);
        }
      }
  
      if( node.next ) { 
        if( node.next.length > 1 ) { 
          for( var f = 0; f < node.next; ++f ) { 
            var forkedNode = node.next[f];
            if( ! forkedNode.postFork ) { 
              throw new Error( "postFork for: " + forkedNode.beg + " > " + forkedNode.end );
            }
          }
        }
        for( var n = 0; n < node.next.length; ++n ) { 
          recursivePFAndPMTest(node.next[n], endName);
        }
      } else { 
        if( node.end != endName ) { 
          throw new Error( "node stairway should end in '" + endName + "' : " + node.beg + " > " + node.end );
        }
      }
    }

    if( ! graph ) { 
      throw new Error( "Argument 'node' is not defined." );
    }
    if( ! end ) { 
      throw new Error( "Argument 'endName' is not defined." );
    }

    for( var g = 0; g < graph.start.length; ++g ) { 
      recursivePFAndPMTest(graph.start[g], end);
    }
    return true;
  }
  
}
