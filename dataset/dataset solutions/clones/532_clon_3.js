function iterateRange(startValue, endValue, callbackFunction) {
    let actualStart = 0;
    let actualEnd = startValue;
    let actualCallback = endValue;

    if (callbackFunction !== undefined) {
        actualStart = startValue;
        actualEnd = endValue;
        actualCallback = callbackFunction;
    }

    for (let loopCounter = actualStart; loopCounter < actualEnd; ++loopCounter) {
        actualCallback(loopCounter);
    }
}
 
var rawInputBuffer = '';
var tokenIndex = 0;
 
function readInputToken(tokenKind) {
    const currentToken = rawInputBuffer[tokenIndex++];
    return tokenKind === 'string' ? currentToken : Number(currentToken);
}
 
function outputResult(value) {
    console.log(value);
}

const OP_TYPE_LESS_EQUAL = 0;
const OP_TYPE_MULTIPLY = 2;
const SIGN_TYPE_PLUS = 0;
const SIGN_TYPE_MINUS = 1;

function parseConstraintDetails(constraintString) {
    const parts = constraintString.split(/<=|>=|\*|\+|-/);
    const nodeA = Number(parts[0]) - 1;
    const nodeB = Number(parts[1]) - 1;
    const weight = Number(parts[2]);

    let operatorType;
    if (constraintString.includes('*')) {
        operatorType = OP_TYPE_MULTIPLY;
    } else {
        operatorType = constraintString.includes('<=') ? OP_TYPE_LESS_EQUAL : 1;
    }

    const signType = constraintString.includes('+') ? SIGN_TYPE_PLUS : SIGN_TYPE_MINUS;

    return {
        nodes: [nodeA, nodeB],
        weight: weight,
        operatorType: operatorType,
        signType: signType
    };
}

function addConstraintEdges(details, simpleEdgesArray, conditionalEdgesArray) {
    const [nodeA, nodeB] = details.nodes;
    const weight = details.weight;
    const { operatorType, signType } = details;

    if (operatorType === OP_TYPE_LESS_EQUAL) {
        if (signType === SIGN_TYPE_PLUS) {
            simpleEdgesArray.push([nodeB, nodeA, -weight]);
        } else {
            simpleEdgesArray.push([nodeB, nodeA, 0]);
            simpleEdgesArray.push([nodeA, nodeB, weight]);
        }
    } else if (operatorType === 1) {
        if (signType === SIGN_TYPE_PLUS) {
            simpleEdgesArray.push([nodeA, nodeB, -weight]);
        } else {
            simpleEdgesArray.push([nodeB, nodeA, weight]);
            simpleEdgesArray.push([nodeA, nodeB, 0]);
        }
    } else { // operatorType === OP_TYPE_MULTIPLY
        if (signType === SIGN_TYPE_PLUS) {
            conditionalEdgesArray.push([[nodeA, nodeB, -weight], [nodeB, nodeA, -weight]]);
        } else {
            simpleEdgesArray.push([nodeB, nodeA, weight]);
            simpleEdgesArray.push([nodeA, nodeB, weight]);
        }
    }
}

function mainLogic(){
	const nodeCount = readInputToken();
	const constraintCount = readInputToken();
	
	const simpleEdges = [];
	const conditionalEdges = [];

	iterateRange(constraintCount, function(){
		const currentConstraintString = readInputToken('string');
		const constraintDetails = parseConstraintDetails(currentConstraintString);
		addConstraintEdges(constraintDetails, simpleEdges, conditionalEdges);
	});

	for (let nodeIdx = 0; nodeIdx < nodeCount; ++nodeIdx) {
		simpleEdges.push([nodeIdx, 0, 0]);
	}

	let overallMaxDistance = -Infinity;

	const numConditionalCombinations = 1 << conditionalEdges.length;
	iterateRange(numConditionalCombinations, function(combinationIndex){
		const currentGraphEdges = [...simpleEdges];
		
		iterateRange(conditionalEdges.length, function(condEdgeIdx){
			const choice = (combinationIndex >> condEdgeIdx) & 1;
			currentGraphEdges.push(conditionalEdges[condEdgeIdx][choice]);
		});

		const distances = new Array(nodeCount).fill(Infinity);
		distances[0] = 0;

		for (let relaxPass = 0; relaxPass < nodeCount; ++relaxPass) {
			for (let edgeIndex = 0; edgeIndex < currentGraphEdges.length; ++edgeIndex) {
				const [sourceNode, targetNode, edgeWeight] = currentGraphEdges[edgeIndex];
				const newDistance = distances[sourceNode] + edgeWeight;
				if (newDistance < distances[targetNode]) {
					distances[targetNode] = newDistance;
				}
			}
		}

		if (distances[0] === 0) {
			const currentMaxInCombination = Math.max(...distances);
			overallMaxDistance = Math.max(overallMaxDistance, currentMaxInCombination);
		}
	});

	if (overallMaxDistance === Infinity) {
		outputResult('inf');
	} else if (overallMaxDistance === -Infinity) {
		outputResult(-1);
	} else {
		outputResult(overallMaxDistance);
	}
}
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
process.stdin.on('data', function(chunk){
	rawInputBuffer += chunk;
});
process.stdin.on('end', function(){
	rawInputBuffer = rawInputBuffer.split(/\s+/);
	mainLogic();
});
