let tokenArray;
let tokenPointer = 0;

function obtainNextToken() {
    if (tokenPointer < tokenArray.length) {
        return tokenArray[tokenPointer++];
    }
    return null;
}

function obtainNextNumeral() {
    const retrievedVal = obtainNextToken();
    return retrievedVal !== null ? parseInt(retrievedVal, 10) : null;
}

function processInputData(sourceContent) {
    tokenArray = sourceContent.replace(/[\n\t\r]+/g, ' ').split(' ').filter(segment => segment.length > 0);
    currentTokenPtr = 0;

    const totalNodes = obtainNextNumeral();

    const nodeValuesStore = [0];
    for (let i = 0; i < totalNodes; ++i) {
        nodeValuesStore.push(obtainNextNumeral());
    }

    const treeConnections = Array.from({ length: totalNodes + 1 }, () => []);
    for (let i = 0; i < totalNodes - 1; ++i) {
        const firstPoint = obtainNextNumeral();
        const secondPoint = obtainNextNumeral();
        treeConnections[firstPoint].push(secondPoint);
        treeConnections[secondPoint].push(firstPoint);
    }

    const pathValueSequences = Array(totalNodes + 1).fill(null);
    const traversalFrontier = [];

    traversalFrontier.push({ currentPoint: 1, antecedent: -1, currentPathSegment: [] });

    while (traversalFrontier.length > 0) {
        const { currentPoint, antecedent, currentPathSegment } = traversalFrontier.shift();

        const extendedPathSegment = currentPathSegment.concat(nodeValuesStore[currentPoint]);
        pathValueSequences[currentPoint] = extendedPathSegment;

        for (const connectedPoint of treeConnections[currentPoint]) {
            if (connectedPoint !== antecedent) {
                traversalFrontier.push({ currentPoint: connectedPoint, antecedent: currentPoint, currentPathSegment: extendedPathSegment });
            }
        }
    }

    const finalCalculatedLengths = [];

    for (let nodeIdentifier = 1; nodeIdentifier <= totalNodes; ++nodeIdentifier) {
        const pathForNode = pathValueSequences[nodeIdentifier];
        if (!pathForNode || pathForNode.length === 0) {
            finalCalculatedLengths.push(0);
            continue;
        }

        const currentLISActiveList = [];

        for (const elementValue of pathForNode) {
            let lowIdx = 0;
            let highIdx = currentLISActiveList.length;
            let insertionPosition = currentLISActiveList.length;

            while (lowIdx < highIdx) {
                const midIdx = Math.floor((lowIdx + highIdx) / 2);
                if (currentLISActiveList[midIdx] >= elementValue) {
                    insertionPosition = midIdx;
                    highIdx = midIdx;
                } else {
                    lowIdx = midIdx + 1;
                }
            }

            if (insertionPosition === currentLISActiveList.length) {
                currentLISActiveList.push(elementValue);
            } else {
                currentLISActiveList[insertionPosition] = elementValue;
            }
        }
        finalCalculatedLengths.push(currentLISActiveList.length);
    }

    console.log(finalCalculatedLengths.join("\n"));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));