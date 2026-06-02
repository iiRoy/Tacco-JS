const parseNumericValue = (strVal) => parseInt(strVal, 10);

function processInputData(rawData) {
    const lines = rawData.split("\n");

    const initialCountsStr = lines[0].split(" ");
    const nodeCount = parseNumericValue(initialCountsStr[0]);
    const relationCount = parseNumericValue(initialCountsStr[1]);

    const relationList = [];
    for (let k = 0; k < relationCount; k++) {
        const relationParts = lines[k + 1].split(" ");
        relationList.push([
            parseNumericValue(relationParts[0]),
            parseNumericValue(relationParts[1]),
            parseNumericValue(relationParts[2])
        ]);
    }

    const KNOWN_STATUS = 1;
    const UNKNOWN_STATUS = 0;

    const knownNodes = new Array(nodeCount + 1).fill(UNKNOWN_STATUS);
    const nodeValues = new Array(nodeCount + 1).fill(UNKNOWN_STATUS);

    knownNodes[0] = KNOWN_STATUS;
    knownNodes[1] = KNOWN_STATUS;

    let resultStatus = "Yes";
    let shouldContinueProcessing = true;

    while (relationList.length > 0 && shouldContinueProcessing) {
        let relationsResolvedInCurrentPass = 0;
        const unresolvedRelationsForNextPass = [];

        for (let idx = 0; idx < relationList.length; idx++) {
            const currentRelation = relationList[idx];
            const uNode = currentRelation[0];
            const vNode = currentRelation[1];
            const valueDifference = currentRelation[2];

            const uIsKnown = knownNodes[uNode] === KNOWN_STATUS;
            const vIsKnown = knownNodes[vNode] === KNOWN_STATUS;

            if (uIsKnown && vIsKnown) {
                if (nodeValues[vNode] - nodeValues[uNode] !== valueDifference) {
                    resultStatus = "No";
                    shouldContinueProcessing = false;
                    break;
                }
                relationsResolvedInCurrentPass++;
            } else if (uIsKnown) {
                knownNodes[vNode] = KNOWN_STATUS;
                nodeValues[vNode] = nodeValues[uNode] + valueDifference;
                relationsResolvedInCurrentPass++;
            } else if (vIsKnown) {
                knownNodes[uNode] = KNOWN_STATUS;
                nodeValues[uNode] = nodeValues[vNode] - valueDifference;
                relationsResolvedInCurrentPass++;
            } else {
                unresolvedRelationsForNextPass.push(currentRelation);
            }
        }

        if (!shouldContinueProcessing) {
            break;
        }

        relationList.splice(0, relationList.length, ...unresolvedRelationsForNextPass);

        if (relationsResolvedInCurrentPass === 0 && relationList.length > 0) {
            let nextComponentSeedNode = -1;
            for (let nodeIdentifier = 1; nodeIdentifier <= nodeCount; nodeIdentifier++) {
                if (knownNodes[nodeIdentifier] === UNKNOWN_STATUS) {
                    nextComponentSeedNode = nodeIdentifier;
                    break;
                }
            }
            if (nextComponentSeedNode !== -1) {
                knownNodes[nextComponentSeedNode] = KNOWN_STATUS;
            }
        }
    }

    console.log(resultStatus);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
