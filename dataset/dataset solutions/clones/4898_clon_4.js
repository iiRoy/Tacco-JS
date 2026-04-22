const qR = require('readline');

function performAssessment() {
    const iT = qR.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    iT.question('', (inputSequence) => {
        const charArray = Array.from(inputSequence);

        let lastCPosition = -1;
        charArray.forEach((char, idx) => {
            if (char === 'C') {
                lastCPosition = idx;
            }
        });

        let finalDecision = "No";

        if (lastCPosition === -1) {
            const containsAnyF = charArray.some(char => char === 'F');
            if (!containsAnyF) {
                finalDecision = "Yes";
            }
        } else {
            const segmentAfterLastC = charArray.slice(lastCPosition);
            const hasFAfterC = segmentAfterLastC.some(char => char === 'F');
            if (hasFAfterC) {
                finalDecision = "Yes";
            }
        }
        
        process.stdout.write(finalDecision + '\n');
        iT.close();
    });
}

performAssessment();