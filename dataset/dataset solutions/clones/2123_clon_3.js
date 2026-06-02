var createInputStream = function(sourcePath) {
    var rawLines = require("fs").readFileSync(sourcePath, "utf8").trim().split("\n");
    var currentLinePointer = 0;
    var totalAvailableLines = rawLines.length;

    return {
        retrieveNextLine: function() {
            if (currentLinePointer >= totalAvailableLines) {
                throw "NoSuchElementException:次に要素は無いよ";
            }
            return rawLines[currentLinePointer++];
        },
        canRetrieveMoreLines: function() {
            return currentLinePointer < totalAvailableLines;
        }
    };
};

var inputReader = createInputStream("/dev/stdin");

var readNextInputLine = function(){ return inputReader.retrieveNextLine(); };
var canReadMoreInput = function(){ return inputReader.canRetrieveMoreLines(); };
var printOutput = function(content){ console.log(content); };
var printError = function(content){ console.error(content); };

var CONVERT_TO_INTEGER = 1;
var SPLIT_BY_WHITESPACE = 2;
var SPLIT_BY_WHITESPACE_TO_NUMBERS = 4;
var SPLIT_BY_CHARACTER = 6;
var SPLIT_BY_CHARACTER_TO_NUMBERS = 7;
var JOIN_WITH_SPACE = 8;
var JOIN_WITH_NEWLINE = 9;
var JOIN_WITHOUT_SEPARATOR = 0;

var convertInput = function(data, conversionMode){
  try{
    switch(conversionMode){
      case CONVERT_TO_INTEGER: return parseInt(data);
      case SPLIT_BY_WHITESPACE: return data.split(" ");
      case SPLIT_BY_WHITESPACE_TO_NUMBERS: return data.split(" ").map(Number);
      case SPLIT_BY_CHARACTER: return data.split("");
      case SPLIT_BY_CHARACTER_TO_NUMBERS: return data.split("").map(Number);
      case JOIN_WITH_SPACE: return data.join(" ");
      case JOIN_WITH_NEWLINE: return data.join("\n");
      case JOIN_WITHOUT_SEPARATOR: return data.join("");
      default: return data;
    }
  }catch(e){
    return data;
  }
};

executeMainProgram();

function executeMainProgram(){
  var initialParams = convertInput(readNextInputLine(), SPLIT_BY_WHITESPACE_TO_NUMBERS);
  var nodeCount = initialParams[0];
  var edgeCount = initialParams[1];
  var blockCount = initialParams[2];

  var graphNodes = new Array(nodeCount);
  var UNASSIGNED_GROUP = null;

  var createGraphNode = function() {
    return {
    	"friend" : [],
        "group" : UNASSIGNED_GROUP
    };
  };

  for(var i = 0; i < nodeCount; i++){
    graphNodes[i] = createGraphNode();
  }

  for(var i = 0; i < edgeCount; i++){
    var edgePair = convertInput(readNextInputLine(), SPLIT_BY_WHITESPACE_TO_NUMBERS);
    var nodeA = edgePair[0] - 1;
    var nodeB = edgePair[1] - 1;
    graphNodes[nodeA]["friend"].push(nodeB);
    graphNodes[nodeB]["friend"].push(nodeA);
  }

  var connectedComponents = [];

  var performBFS = function(startingNodeIndex){
    if(graphNodes[startingNodeIndex]["group"] !== UNASSIGNED_GROUP){
       return;
    }

    var currentComponentIdentifier = connectedComponents.length;
    connectedComponents[currentComponentIdentifier] = new Set();

    var bfsTraversalQueue = [graphNodes[startingNodeIndex]];

    while(bfsTraversalQueue.length > 0){
      var currentNodeObject = bfsTraversalQueue.shift();

      if(currentNodeObject["group"] !== UNASSIGNED_GROUP){
         continue;
      }

      currentNodeObject["group"] = currentComponentIdentifier;

      for(var j = 0; j < currentNodeObject["friend"].length; j++){
        var neighborNodeIndex = currentNodeObject["friend"][j];
        bfsTraversalQueue.push(graphNodes[neighborNodeIndex]);
      }
    }
  };

  for(var i = 0; i < nodeCount; i++){
    performBFS(i);
  }

  for(var i = 0; i < nodeCount; i++){
    var assignedGroupIdentifier = graphNodes[i]["group"];
    if (assignedGroupIdentifier !== UNASSIGNED_GROUP) {
        connectedComponents[assignedGroupIdentifier].add(i);
    }
  }

  var potentialFriendSuggestions = new Array(nodeCount);
  for(var i = 0; i < nodeCount; i++){
    var nodeGroup = graphNodes[i]["group"];
    var groupSize = connectedComponents[nodeGroup].size;
    var currentFriendsCount = graphNodes[i]["friend"].length;
    potentialFriendSuggestions[i] = groupSize - 1 - currentFriendsCount;
  }

  for(var i = 0; i < blockCount; i++){
    var blockedPair = convertInput(readNextInputLine(), SPLIT_BY_WHITESPACE_TO_NUMBERS);
    var blockedNode1 = blockedPair[0] - 1;
    var blockedNode2 = blockedPair[1] - 1;

    if(graphNodes[blockedNode1]["group"] === graphNodes[blockedNode2]["group"]){
       potentialFriendSuggestions[blockedNode1]--;
       potentialFriendSuggestions[blockedNode2]--;
    }
  }

  printOutput(convertInput(potentialFriendSuggestions, JOIN_WITH_SPACE));
}
