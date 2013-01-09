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
  
  postForkAndPreMergeTest: function(node) { 
    if( node.next.length > 1 ) { 
      for( var n = 0; n < node.next; ++n ) { 
        var forkedNode = node.next[n];
        ok( forkedNode.postFork, "postFork for: " + forkedNode.beg + " > " + forkedNode.end );
      }
    }
    if( /^Join/.test( node.end ) ) {
      ok( node.preMerge, "preMerge for: " + node.beg + " > " + node.end );
    }
    if( node.next ) { 
      for( var n = 0; n < node.next; ++n ) { 
        recPostForKAndPreMerge(node.next[n])
      }
    } else { 
      ok( node.end == "End", "node stairway ends in 'END': " + node.beg + " > " + node.end );
    }
  }
  
}