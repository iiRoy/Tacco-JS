function processSingleCase(initialA, B, C, D) {
    if (initialA < B) {
        return "No";
    }
    if (D < B) {
        return "No";
    }
    if (initialA < C) {
        return "Yes";
    }

    const targetA = initialA;
    let currentVal = (initialA % B) + B;

    const visitedStates = new Set();

    function advanceState(val) {
        if (val >= targetA) {
            return true;
        }
        if (val < B) {
            return false;
        }
        if (visitedStates.has(val)) {
            return false;
        }

        visitedStates.add(val);

        let nextVal;
        if ((val - B) <= C) {
            nextVal = val - B + D;
        } else {
            nextVal = val - B;
        }

        return advanceState(nextVal);
    }

    return advanceState(currentVal) ? "Yes" : "No";
}

function main(inputContent) {
    const dataLines = inputContent.split('\n');
    const numberOfCases = parseInt(dataLines[0], 10);

    for (let i = 1; i <= numberOfCases; i++) {
        const [valA, valB, valC, valD] = dataLines[i].split(' ').map(Number);
        console.log(processSingleCase(valA, valB, valC, valD));
    }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
