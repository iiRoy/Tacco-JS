var read = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var obj;
var inLine = [];
read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
  obj = init(inLine);
  console.error("\n");
  var start = new Date();
  Main();
  var end = new Date() - start;
  
  myerr("time : " + (end) + "ms");
  myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function makeClone(obj){return JSON.parse(JSON.stringify(obj));}
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
function next(){return obj.next();} function hasNext(){return obj.hasNext();}
function init(input){  
  var returnObj = {
    list : input, index : 0, max : input.length,
    hasNext : function(){return (this.index < this.max);},
    next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
  };
  return returnObj;
}
function myout(s){console.log(s);}
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

function Main(){
	var firstLine = nextIntArray();
	var N = firstLine[0];
	var K = firstLine[1];
	var sourceNumbers = nextIntArray();
	var minTotalCost = Math.pow(10,16);

	if(K === 1){
		myout(0);
		return;
	}

	function calculateCostForSubset(subsetElements) {
		let accumulatedCost = 0;
		let lastAdjustedValue = subsetElements[0];

		for (let k = 1; k < subsetElements.length; k++) {
			let currentConsideredValue = subsetElements[k];
			if (lastAdjustedValue >= currentConsideredValue) {
				const requiredIncrease = lastAdjustedValue - currentConsideredValue + 1;
				accumulatedCost += requiredIncrease;
				lastAdjustedValue += requiredIncrease;
			} else {
				lastAdjustedValue = currentConsideredValue;
			}
		}
		return accumulatedCost;
	}

	function generateSubsequences(currentIdx, currentSequence) {
		if (currentSequence.length === K) {
			const sequenceCost = calculateCostForSubset(currentSequence);
			minTotalCost = Math.min(minTotalCost, sequenceCost);
			return;
		}

		if (currentIdx >= N || (N - currentIdx) < (K - currentSequence.length)) {
			return;
		}

		// Option 1: Include the element at currentIdx
		generateSubsequences(currentIdx + 1, [...currentSequence, sourceNumbers[currentIdx]]);

		// Option 2: Exclude the element at currentIdx
		generateSubsequences(currentIdx + 1, currentSequence);
	}

	// Start the recursion. sourceNumbers[0] is always included.
	// We start considering elements from index 1 for inclusion/exclusion.
	generateSubsequences(1, [sourceNumbers[0]]);

	myout(minTotalCost);
}
