var elementCount;
var parentArray = [];
var rankArray = [];

function initializeDSU() {
    iterateRange(elementCount, function(idx) {
        parentArray[idx] = idx;
        rankArray[idx] = 0;
    });
}

function findRepresentative(nodeA) {
    const currentParent = parentArray[nodeA];
    if (currentParent === nodeA) {
        return nodeA;
    }
    const rootNode = findRepresentative(currentParent);
    parentArray[nodeA] = rootNode;
    return rootNode;
}

function areConnected(nodeA, nodeB) {
    const rootOfA = findRepresentative(nodeA);
    const rootOfB = findRepresentative(nodeB);
    return rootOfA === rootOfB;
}

function unionSets(nodeA, nodeB) {
    let rootA = findRepresentative(nodeA);
    let rootB = findRepresentative(nodeB);

    if (rootA === rootB) {
        return;
    }

    const rankA = rankArray[rootA];
    const rankB = rankArray[rootB];

    if (rankA > rankB) {
        parentArray[rootB] = rootA;
    } else {
        parentArray[rootA] = rootB;
        if (rankA === rankB) {
            rankArray[rootB]++;
        }
    }
}

function executeOperations() {
    elementCount = readToken();
    initializeDSU();
    const queryCount = readToken();
    iterateRange(queryCount, function() {
        const operationType = readToken();
        const nodeA = readToken();
        const nodeB = readToken();
        if (operationType === 0) {
            unionSets(nodeA, nodeB);
        } else {
            const connectionStatus = areConnected(nodeA, nodeB);
            outputValue(Number(connectionStatus));
        }
    });
}
 
function iterateRange(startVal, endVal, callbackFn){
	if (typeof callbackFn === 'undefined') {
		callbackFn = endVal;
		endVal = startVal;
		startVal = 0;
	}
	for (let loopIndex = startVal; loopIndex < endVal; ++loopIndex) {
		const shouldContinue = callbackFn(loopIndex);
		if (shouldContinue === false) {
			break;
		}
	}
}
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
var rawData = '';
var tokenPointer = 0;
 
function readToken(tokenType){
    const currentToken = rawData[tokenPointer];
	tokenPointer++;
	if (tokenType === 'string') {
		return currentToken;
	} else {
		return Number(currentToken);
	}
}
 
function outputValue(valueToPrint){
	console.log(valueToPrint);
}
 
process.stdin.on('data', function(dataChunk){
	rawData += dataChunk;
});
process.stdin.on('end', function(){
	rawData = rawData.split(/\s+/);
	executeOperations();
});
