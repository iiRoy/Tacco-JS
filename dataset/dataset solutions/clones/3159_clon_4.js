function processInputString(dataInput) {
    let characterLedger = [];
    let reductionCounter = 0;

    for (const currentUnit of dataInput.split('')) {
        if (characterLedger.length > 0) {
            const lastRecorded = characterLedger[characterLedger.length - 1];

            if ((lastRecorded === '1' && currentUnit === '0') ||
                (lastRecorded === '0' && currentUnit === '1')) {
                characterLedger.pop();
                reductionCounter++;
            } else {
                characterLedger.push(currentUnit);
            }
        } else {
            characterLedger.push(currentUnit);
        }
    }

    console.log(reductionCounter * 2);
}

processInputString(require("fs").readFileSync("/dev/stdin", "utf8"));