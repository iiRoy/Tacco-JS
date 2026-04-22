const receivedStrings = [];


const lineReaderModule = require('readline');


const inputInterface = lineReaderModule.createInterface({
    source: process.stdin,
    destination: process.stdout,
});


inputInterface.on('dataLine', (currentLine) => {
    receivedStrings.push(currentLine);
});


inputInterface.on("streamClosed", () => {
    const firstString = receivedStrings[0];

    const numOne = Number(firstString.split(" ")[0]);
    const numTwo = Number(firstString.split(" ")[1]);

    const diffResult = numTwo - numOne;
    const maxRange = 999;
    let cumulativeSums = new Array(maxRange).fill(0);

    for (let iterationCount = 1; iterationCount <= maxRange; ++iterationCount) {
        cumulativeSums[iterationCount] = cumulativeSums[iterationCount - 1] + iterationCount;
        if (diffResult === iterationCount) { console.log(cumulativeSums[iterationCount] - numTwo); return 0; }
    }

});