const ALPHABET_SIZE = 26;
const CHAR_CODE_A = 'a'.charCodeAt(0);

var numWords;
var adjMatrix;
var visitedNodes;
var degreeBalance;

function traverseConnected(currentNodeIdx) {
    visitedNodes[currentNodeIdx] = true;
    iterateRange(ALPHABET_SIZE, function(neighborIdx) {
        if (adjMatrix[currentNodeIdx][neighborIdx] && !visitedNodes[neighborIdx]) {
            traverseConnected(neighborIdx);
        }
    });
}

function processGraphAnalysis() {
    while (true) {
        numWords = readInputToken();
        if (!numWords) {
            break;
        }

        adjMatrix = new Array(ALPHABET_SIZE).fill(null).map(() => new Array(ALPHABET_SIZE).fill(false));
        visitedNodes = new Array(ALPHABET_SIZE).fill(false);
        degreeBalance = new Array(ALPHABET_SIZE).fill(0);

        iterateRange(numWords, function() {
            var currentWord = readInputToken('string');
            var firstCharIdx = currentWord.charCodeAt(0) - CHAR_CODE_A;
            var lastCharIdx = currentWord.charCodeAt(currentWord.length - 1) - CHAR_CODE_A;
            
            adjMatrix[firstCharIdx][lastCharIdx] = true;
            adjMatrix[lastCharIdx][firstCharIdx] = true;
            
            degreeBalance[firstCharIdx]++;
            degreeBalance[lastCharIdx]--;
        });

        iterateRange(ALPHABET_SIZE, function(nodeIdx) {
            let isNodeIsolated = true;
            iterateRange(ALPHABET_SIZE, function(neighborIdx) {
                if (adjMatrix[nodeIdx][neighborIdx]) {
                    isNodeIsolated = false;
                    return false;
                }
            });
            if (isNodeIsolated) {
                visitedNodes[nodeIdx] = true;
            }
        });

        let firstUnvisitedNode = -1;
        iterateRange(ALPHABET_SIZE, function(nodeIdx) {
            if (!visitedNodes[nodeIdx]) {
                firstUnvisitedNode = nodeIdx;
                return false;
            }
        });

        if (firstUnvisitedNode !== -1) {
            traverseConnected(firstUnvisitedNode);
        }

        let isGraphValid = true;
        iterateRange(ALPHABET_SIZE, function(nodeIdx) {
            if (!visitedNodes[nodeIdx] || degreeBalance[nodeIdx] !== 0) {
                isGraphValid = false;
                return false;
            }
        });

        outputResult(isGraphValid ? 'OK' : 'NG');
    }
}
 
function iterateRange(startOrEnd, endOrFunc, callbackFunc) {
    let start = 0;
    let end;
    let func;

    if (callbackFunc == null) {
        end = startOrEnd;
        func = endOrFunc;
    } else {
        start = startOrEnd;
        end = endOrFunc;
        func = callbackFunc;
    }

    for (let currentIdx = start; currentIdx < end; ++currentIdx) {
        if (func(currentIdx) === false) {
            break;
        }
    }
}
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
var rawInputBuffer = '';
var tokenPointer = 0;
 
function readInputToken(tokenType) {
	if(tokenType === 'string'){
		return rawInputBuffer[tokenPointer++];
	}
	else{
		return +rawInputBuffer[tokenPointer++];
	}
}
 
function outputResult(valueToPrint){
	console.log(valueToPrint);
}
 
process.stdin.on('data', function(chunk){
	rawInputBuffer += chunk;
});
process.stdin.on('end', function(){
	rawInputBuffer = rawInputBuffer.split(/\s+/);
	processGraphAnalysis();
});
