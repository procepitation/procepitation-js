
var engine = { 
// Constants

var map = { 
  start: 0,
  end: 1,
  fork: 2,
  script: 3
};



// -----
// Parts
// -----
function Node(myType) { 
  this.type = myType; 
};

function ScriptNode(myScript) { 
  this.type = map.script;
  this.script = myScript;
}
ScriptNode.prototype = new Node();

function Context() { 
  this.done = false;
};

// -------
// Actions
// -------

// dictionary
var nodeFunctions = { 
  start:  function(node, context) { 
            console.log(">") 
          },
  end:    function(node, context) { 
            console.log("<" ); 
            context.done = true 
          },
  fork:   function(node, context) { console.log("F") },
  script: function(node, context) { 
            node.script(context);
          }
};

// switch/lookup
var functionLookup = [
  nodeFunctions.start,
  nodeFunctions.end,
  nodeFunctions.fork,
  nodeFunctions.script
];

// Engine processing
function run(runInst) { 

  var context = new Context();
  
  for( var i=0, done = false; !context.done; ++i) {
    var node = runInst[i];
    functionLookup[node.type](node, context);
  }

}

// ---------
// Test
// --------

var inst = [
  new Node(map.start),
  new ScriptNode(function() { console.log("Scripted!") }),
  new Node(map.end)
];

