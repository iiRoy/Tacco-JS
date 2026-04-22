const currentEnv = require('readline');

function processBatch(collectedInput) {
    const totalItems = Number.parseInt(collectedInput[0], 10);
    const dataEntries = collectedInput.slice(1, totalItems + 1);

    const computedResults = dataEntries.map((entryString) => {
        const [firstVal, secondVal, thirdVal] = entryString.split(" ").map(Number.parseInt);

        const adjustedFirst = firstVal - 1;
        const adjustedSecond = secondVal - 1;

        const dynamicOffset = (adjustedFirst % 3 !== 2) ? Math.floor(adjustedSecond / 2) : 0;

        const finalResult = 196471 -
                            (adjustedFirst * 195) -
                            (Math.floor(adjustedFirst / 3) * 5) -
                            (adjustedSecond * 20) +
                            dynamicOffset -
                            thirdVal;
        return finalResult;
    });

    computedResults.forEach((outcome) => console.log(outcome));
}

function establishInputMechanism() {
    const receivedLines = [];
    const streamHandler = currentEnv.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    streamHandler.on('line', (singleLine) => {
        receivedLines.push(singleLine);
    });

    streamHandler.on('close', () => {
        processBatch(receivedLines);
    });
}

establishInputMechanism();