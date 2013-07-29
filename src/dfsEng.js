
var bpmDfs = { 

  function StackEntry(current, stack, childIndex) { 
    this.node = current;
    this.prev = stack;
    this.index = childIndex;
  }

  dfs: function(startNodes) { 
    var stack = null;
    var i = 0;

    var node = ...
    // keep track of whether a node has been visited? 
    var visitNum = node.visits;
    while(true) { 
      if( i == 0 ) { 
        preOrder(node);
      }
      var numChildren = node.children.length;
      var j = i;
      for(; i < numChildren; ++i ) { 
        j = i;
        var child = node.children[a];
        // has child been visited this time? 
        if( visitChild(node, child) ) { 
          beforeChild(node, child);
          stack = new StackEntry(node, stack, i+1); 
          node = child;
          i = 0;
          break;
        } else { 
          skipChild(node, child);
        }
      }
      if( j = numChilden -1 ) { 
        // clear stack? 
      }
      if( i == numChildren ) { 
        postOrder(node);
        if( stack == null ) { 
          return;
        }
        afterChild(stack.node, node);
        node = stack.node;
        stack = stack.prev;
        i = stack.index;
      }
    }
  },

  preOrder: function(node) { 
    // function executed when a node is visitied (before any further processing)
  },
  visitChild: function(node, child) { 
    // whether or not a child should be visited
  }
  beforeChild: function(node, child) { 
    // function executed before going to a child
  },
  skipChild: function(node, child) { 
    // function executed if a child has been skipped
  },
  afterChild: function(node, child) { 
    // function executed after a child has been visited
  },
  postOrder: function(node) { 
    // function executed once all children have been visited of a node
  },

}
