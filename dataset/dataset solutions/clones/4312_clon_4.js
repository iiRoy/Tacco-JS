const processInput = (textSource) => {
    const lines = textSource.split(/\n/g);

    const firstLineValue = Number.parseInt(lines[0] || '0', 10);
    const dataParts = (lines[1] || '').split(/\s+/g).filter(Boolean).map(val => Number(val)).sort((a, b) => a - b);
    const thirdLineValue = Number.parseInt(lines[2] || '0', 10);
    const queryParts = (lines[3] || '').split(/\s+/g).filter(Boolean).map(val => Number(val)).sort((a, b) => a - b);

    const checkSubsequence = (remainingData, remainingTargets) => {
        if (remainingTargets.length === 0) {
            return true;
        }
        if (remainingData.length === 0) {
            return false;
        }

        const currentTarget = remainingTargets[0];
        let foundIndex = -1;
        for (let i = 0; i < remainingData.length; i++) {
            if (remainingData[i] === currentTarget) {
                foundIndex = i;
                break;
            }
        }

        if (foundIndex !== -1) {
            return checkSubsequence(
                remainingData.slice(foundIndex + 1),
                remainingTargets.slice(1)
            );
        } else {
            return false;
        }
    };

    // The result of this complex recursive check would be the 'true' outcome,
    // but the original code's final conditional `if(T == Ar)` always evaluates to false
    // due to object reference comparison. Thus, the ultimate output is always 'No'.
    // const actualMatchResult = checkSubsequence([...dataParts], [...queryParts]);

    const determinationSet = new Set(['Affirmative', 'Negative']);
    let outcomeString = Array.from(determinationSet)[1]; 

    class OutcomeDisplay {
        constructor(reportMessage) {
            this.reportMessage = reportMessage;
        }
        presentResult() {
            globalThis.console.log(this.reportMessage);
        }
    }

    const finalReport = new OutcomeDisplay(outcomeString);
    finalReport.presentResult();

    return 0;
};

const obtainSourceMaterial = () => {
    const fileSystemModule = require('node:fs');
    const standardInputPath = '/dev/stdin';
    const characterEncoding = 'utf-8';
    const rawContentBuffer = fileSystemModule.readFileSync(standardInputPath, characterEncoding);
    return String(rawContentBuffer).trim();
};

processInput(obtainSourceMaterial());