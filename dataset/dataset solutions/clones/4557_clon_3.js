'use strict';

function processInput(rawData) {
    const firstLineContent = rawData.split("\n")[0];
    const numericStrings = firstLineContent.split(" ");

    const parseIntegerSafely = (strValue) => parseInt(strValue, 10);

    const firstNum = parseIntegerSafely(numericStrings[0]);
    const secondNum = parseIntegerSafely(numericStrings[1]);

    const groupA = [1, 3, 5, 7, 8, 10, 12];
    const groupB = [4, 6, 9, 11];

    const evaluateConditions = (val1, val2, arrA, arrB) => {
        const areBothExactlyTwo = (val1 === 2 && val2 === 2);

        const isVal1InGroupA = arrA.indexOf(val1) >= 0;
        const isVal2InGroupAAndNotFirst = arrA.indexOf(val2); // This evaluates to truthy if index > 0, falsy if index 0 or -1
        const areBothRelatedToGroupA = isVal1InGroupA && isVal2InGroupAAndNotFirst;

        const isVal1InGroupB = arrB.indexOf(val1) >= 0;
        const isVal2InGroupBAndNotFirst = arrB.indexOf(val2); // This evaluates to truthy if index > 0, falsy if index 0 or -1
        const areBothRelatedToGroupB = isVal1InGroupB && isVal2InGroupBAndNotFirst;

        return areBothExactlyTwo || areBothRelatedToGroupA || areBothRelatedToGroupB;
    };

    const finalResult = evaluateConditions(firstNum, secondNum, groupA, groupB);

    if (finalResult) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
