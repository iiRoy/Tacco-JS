const calculateMismatchCount = (sourceContent) => {
    const fixedPattern = 'CODEFESTIVAL2016';

    const acquireTargetFragment = (completeText, currentIdx = 0, accumulatedFragment = '') => {
        if (accumulatedFragment.length >= 16 || currentIdx >= completeText.length) {
            return accumulatedFragment;
        }
        const charAtCurrent = completeText[currentIdx];
        if (charAtCurrent === '\n') {
            return accumulatedFragment;
        }
        return acquireTargetFragment(completeText, currentIdx + 1, accumulatedFragment + charAtCurrent);
    };

    const processedFragment = acquireTargetFragment(sourceContent);

    const positionsToExamine = Array.from({ length: 16 }, (_, index) => index);

    const differingPositions = positionsToExamine.reduce((counter, position) => {
        const inputChar = processedFragment[position];
        const patternChar = fixedPattern[position];

        if (inputChar !== patternChar) {
            return counter + 1;
        }
        return counter;
    }, 0);

    return differingPositions;
};

const executeLogic = (externalData) => {
    const finalResult = calculateMismatchCount(externalData);
    console.log(finalResult);
};

executeLogic(require("fs").readFileSync("/dev/stdin", "utf8"));