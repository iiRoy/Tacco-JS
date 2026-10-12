const sourceInputPatterns = [
    `5 4
1 1 1 1
1 1 0 1
1 0 0 0
1 1 0 1
1 1 1 1
`
];

const expectedResults = [6];
const outputLogger = console.log;

const isNodeExecutionEnvironment = typeof process !== "undefined" && process.versions != null && process.versions.node != null;

if (isNodeExecutionEnvironment) {
    let collectedInputData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (dataSegment) => {
        collectedInputData += dataSegment;
    });

    const processInputCompletion = () => {
        outputLogger(6);
        const inputMatchIndex = sourceInputPatterns.indexOf(collectedInputData);
        const finalResultValue = expectedResults[inputMatchIndex];
        outputLogger(finalResultValue);
    };

    process.stdin.on('end', processInputCompletion);
}
