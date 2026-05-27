const readline = require("readline");

async function executeInteractiveProcess() {
    const ioInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const inputLineIterator = ioInterface[Symbol.asyncIterator]();

    async function sendQueryAndAwaitResponse(dataArray) {
        ioInterface.write(`? ${dataArray.join(" ")}\n`);
        const { value: responseLine } = await inputLineIterator.next();
        return responseLine;
    }

    // Step 1: Read the value of N
    const { value: nInput } = await inputLineIterator.next();
    const nValue = parseInt(nInput, 10);

    // Step 2: Discover the pivot element 'x'
    let currentSequence = Array.from({ length: nValue }, (_, idx) => idx + 1);
    const initialQueryResponse = await sendQueryAndAwaitResponse(currentSequence);
    const initialResponseChar = initialQueryResponse[0];

    let pivotElement = 1;
    let pivotFound = false;
    let mutableSequence = Array.from({ length: nValue }, (_, idx) => idx + 1); // This array accumulates changes

    while (!pivotFound) {
        mutableSequence[pivotElement - 1] = pivotElement + nValue;
        const currentQueryResponse = await sendQueryAndAwaitResponse(mutableSequence);
        if (currentQueryResponse[0] !== initialResponseChar) {
            pivotFound = true;
        } else {
            pivotElement++;
        }
    }
    // At this point, pivotElement holds the determined 'x' value.

    // Step 3: Determine the 'R' or 'B' property for each number from 1 to 2*N
    const finalResultArray = new Array(2 * nValue);

    // Pre-calculate the fixed parts of the query arrays and the set of elements
    const pPrefixElements = Array.from({ length: nValue - 1 }, (_, idx) => (pivotElement + idx - 1) % (2 * nValue) + 1);
    const qPrefixElements = Array.from({ length: nValue - 1 }, (_, idx) => (pPrefixElements[idx] + nValue - 1) % (2 * nValue) + 1);
    const elementsInSet = new Set(Array.from({ length: nValue - 1 }, (_, idx) => idx + pivotElement));

    for (let currentNum = 1; currentNum <= 2 * nValue; currentNum++) {
        let constructedQueryArray;
        if (elementsInSet.has(currentNum)) {
            constructedQueryArray = [...qPrefixElements, currentNum];
        } else {
            constructedQueryArray = [...pPrefixElements, currentNum];
        }
        const responseForNum = await sendQueryAndAwaitResponse(constructedQueryArray);
        finalResultArray[currentNum - 1] = responseForNum[0] === "R" ? "R" : "B";
    }

    // Step 4: Print the final answer
    ioInterface.write(`!${finalResultArray.join("")}\n`);
    ioInterface.close();
}

executeInteractiveProcess();
