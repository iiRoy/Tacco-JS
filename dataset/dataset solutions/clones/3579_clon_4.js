const fileSystemInterface = require("fs");
const rawInputContent = fileSystemInterface.readFileSync("/dev/stdin", "utf8");
const processedNumericData = rawInputContent.split("\n").map(entry => +entry);

const failMessage = "No";
const passMessage = "Yes";

function validateStructure(dataSource) {
    const limitVal = dataSource[0];
    const markingsMap = new Set(); 

    function traverseInterval(currentPoint, initialMarker, terminalMarker) {
        if (currentPoint >= terminalMarker) {
            return currentPoint;
        }

        currentPoint++;
        if (dataSource[currentPoint] !== currentPoint) {
            return 0; 
        }

        currentPoint++;
        if (((dataSource[currentPoint] ^ currentPoint) & 1) !== 0) {
            return 0; 
        }

        const currentDatum = dataSource[currentPoint];

        if (terminalMarker < currentDatum) {
            markingsMap.add(terminalMarker);
            terminalMarker = currentDatum;
        } else if (initialMarker === currentDatum) {
            do {
                initialMarker += 2;
            } while (markingsMap.has(initialMarker));
        } else {
            return 0; 
        }

        return traverseInterval(currentPoint, initialMarker, terminalMarker);
    }

    let currentPoint = 1;
    while (currentPoint <= limitVal) {
        if (((dataSource[currentPoint] ^ currentPoint) & 1) !== 0) {
            return failMessage;
        }

        const initialMarker = currentPoint;
        let terminalMarker = dataSource[currentPoint];

        let postTraversalPoint = traverseInterval(currentPoint, initialMarker, terminalMarker);

        if (postTraversalPoint === 0) {
            return failMessage;
        }
        
        currentPoint = postTraversalPoint;
        currentPoint++; 
    }

    return passMessage;
}

const finalEvaluation = validateStructure(processedNumericData);
console.log(finalEvaluation);