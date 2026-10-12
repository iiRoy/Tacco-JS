var rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
var lines = rawInput.split("\n");

const transformNameLogic = (originalName) => {
    return Array.from(originalName).reduce((acc, char) => {
        let { output, shouldAdd } = acc;
        let nextShouldAdd = shouldAdd;

        if (nextShouldAdd) {
            output += char;
            nextShouldAdd = false;
        }

        if (/[aiueo]/.test(char)) {
            nextShouldAdd = true;
        }

        return { output, shouldAdd: nextShouldAdd };
    }, { output: '', shouldAdd: true }).output;
};

const calculatePrefixDifference = (strA, strB, blockN) => {
    const minLength = Math.min(strA.length, strB.length);
    let diffIndex = -1;

    for (let k = 0; k < blockN; k++) {
        if (strA[k] !== strB[k]) {
            diffIndex = k;
            break;
        }
    }

    if (diffIndex !== -1) {
        return diffIndex;
    } else {
        if (strA.length === strB.length) {
            return -1;
        } else {
            return minLength;
        }
    }
};

const processInputBlocks = (inputLines) => {
    let currentLineIndex = 0;

    const getNextLine = () => inputLines[currentLineIndex++];

    while (true) {
        const currentBlockSizeStr = getNextLine();
        const currentBlockSize = +currentBlockSizeStr;

        if (currentBlockSize === 0) {
            break;
        }

        const namesForBlock = Array.from({ length: currentBlockSize }, () => getNextLine());

        const processedNames = namesForBlock
            .map(transformNameLogic)
            .sort();

        const finalResultState = processedNames.reduce((acc, currentName, idx, arr) => {
            if (acc.earlyExit) {
                return acc;
            }
            if (idx === 0) {
                return acc;
            }

            const previousName = arr[idx - 1];
            const comparisonResult = calculatePrefixDifference(previousName, currentName, currentBlockSize);

            if (comparisonResult === -1) {
                return { maxVal: -2, earlyExit: true };
            }
            return { maxVal: Math.max(acc.maxVal, comparisonResult), earlyExit: false };
        }, { maxVal: 0, earlyExit: false });

        console.log(finalResultState.maxVal + 1);
    }
};

processInputBlocks(lines);
