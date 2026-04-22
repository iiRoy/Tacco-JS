const acquireSourceData = () => require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

const createDataStream = (dataLines) => {
    let cursorPosition = 0;
    const allRecords = dataLines;

    const pullNextRecord = () => {
        if (cursorPosition >= allRecords.length) {
            return "";
        }
        return allRecords[cursorPosition++];
    };

    const retrieveInteger = () => parseInt(pullNextRecord(), 10);
    const retrieveIntegerArray = () => pullNextRecord().split(" ").map(Number);

    return {
        fetchNumeric: retrieveInteger,
        fetchNumericArray: retrieveIntegerArray
    };
};

const displayResult = (content) => console.log(content);
const reportIssue = (content) => console.error(content);

const solveProblem = () => {
    const inputSource = createDataStream(acquireSourceData());

    const itemCount = inputSource.fetchNumeric();
    const firstSet = inputSource.fetchNumericArray();
    const secondSet = inputSource.fetchNumericArray();

    const differences = firstSet.map((val, idx) => val - secondSet[idx]);

    const aggregateDifference = differences.reduce((sum, diff) => sum + diff, 0);

    const positiveAdjustments = [];
    let cumulativeShortfall = 0;
    let initialCompensations = 0;

    differences.forEach(diff => {
        if (diff >= 0) {
            positiveAdjustments.push(diff);
        } else {
            cumulativeShortfall += Math.abs(diff);
            initialCompensations++;
        }
    });

    if (aggregateDifference < 0) {
        displayResult(-1);
    } else {
        positiveAdjustments.sort((valA, valB) => valB - valA);

        let totalCompensations = initialCompensations;
        let remainingShortfall = cumulativeShortfall;
        
        for (const positiveValue of positiveAdjustments) {
            if (remainingShortfall <= 0) {
                break;
            }
            remainingShortfall -= positiveValue;
            totalCompensations++;
        }
        
        displayResult(totalCompensations);
    }
};

solveProblem();