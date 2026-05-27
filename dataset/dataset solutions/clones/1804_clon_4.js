function computeXorBasis(initialValues, elements) {
    let currentSums = new Set(initialValues);

    for (const element of elements) {
        const sumsToAddInThisIteration = new Set();
        for (const existingSum of currentSums) {
            sumsToAddInThisIteration.add(existingSum ^ element);
        }
        for (const newSum of sumsToAddInThisIteration) {
            currentSums.add(newSum);
        }
    }
    return currentSums;
}

function Main(input) {
    const lines = input.split('\n');
    const testCaseCount = parseInt(lines[0], 10);
    const results = [];

    let currentLinePointer = 1;

    for (let i = 0; i < testCaseCount; i++) {
        const N = parseInt(lines[currentLinePointer++], 10);
        const A = lines[currentLinePointer++].split(' ').map(Number);
        const S = lines[currentLinePointer++];

        const lastOneIndex = S.lastIndexOf('1');
        const zeroSuffixLength = (lastOneIndex === -1) ? S.length : (S.length - 1 - lastOneIndex);

        const prefixElements = A.slice(0, N - zeroSuffixLength);
        const suffixElements = A.slice(N - zeroSuffixLength);

        const xorSumsFromPrefix = computeXorBasis(new Set([0]), prefixElements);

        let testCaseOutcome = 0;

        let zeroPathFound = false;
        for (const initialSumFromPrefix of xorSumsFromPrefix) {
            const xorSumsFromSuffix = computeXorBasis(new Set([initialSumFromPrefix]), suffixElements);

            if (xorSumsFromSuffix.has(0)) {
                zeroPathFound = true;
                break;
            }
        }

        if (!zeroPathFound) {
            testCaseOutcome = 1;
        }
        results.push(testCaseOutcome);
    }

    console.log(results.join('\n'));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
