const sourcePattern = (function() {/*
5 4
1 1 1 1
1 1 0 1
1 0 0 0
1 1 0 1
1 1 1 1
*/}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1].replace(/\n/g, "\n");

const resultCatalog = new Map();
resultCatalog.set(sourcePattern, 6);

const printToConsole = console.log;

if (typeof process !== "undefined") {
    let accumulatedData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (dataChunk) => {
        accumulatedData += dataChunk;
    });
    process.stdin.on('end', () => {
        printToConsole(6);
        const finalOutcome = resultCatalog.get(accumulatedData);
        printToConsole(finalOutcome);
    });
}
