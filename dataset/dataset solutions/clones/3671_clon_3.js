function processInputData(rawInputString) {
    const inputLines = rawInputString.split('\n');
    const RADIX_DECIMAL = 10;
    const totalTestCases = parseInt(inputLines[0], RADIX_DECIMAL);

    const parseCaseParameters = (lineContent) => {
        const parts = lineContent.split(' ');
        const currentA = parseInt(parts[0], RADIX_DECIMAL);
        const divisorB = parseInt(parts[1], RADIX_DECIMAL);
        const limitC = parseInt(parts[2], RADIX_DECIMAL);
        const incrementD = parseInt(parts[3], RADIX_DECIMAL);
        return { currentA, divisorB, limitC, incrementD };
    };

    for (let caseIdx = 1; caseIdx <= totalTestCases; caseIdx++) {
        let isSolutionFound = false;
        const { currentA, divisorB, limitC, incrementD } = parseCaseParameters(inputLines[caseIdx]);

        const initialAValue = currentA;
        let nextAValueRemainder = currentA % divisorB;

        if (currentA < divisorB) {
            console.log("No");
            continue;
        }
        if (incrementD < divisorB) {
            console.log("No");
            continue;
        }
        if (currentA < limitC) {
            console.log("Yes");
            continue;
        }

        {
            let adjustedStartingA = nextAValueRemainder + divisorB;
            let currentIterationA = adjustedStartingA;

            while (currentIterationA >= divisorB) {
                const differenceAandB = currentIterationA - divisorB;

                if (differenceAandB <= limitC) {
                    currentIterationA = differenceAandB + incrementD;
                } else {
                    currentIterationA = differenceAandB;
                }

                if (currentIterationA >= initialAValue) {
                    console.log("Yes");
                    isSolutionFound = true;
                    break;
                }
            }
        }

        if (!isSolutionFound) {
            console.log("No");
        }
    }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
