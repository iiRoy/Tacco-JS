const inputSource = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = inputSource.trim().split("\n");
const caseCount = Number(lineSegments.shift());

const characterMappings = {
    1: ".,!? ",
    2: "abc",
    3: "def",
    4: "ghi",
    5: "jkl",
    6: "mno",
    7: "pqrs",
    8: "tuv",
    9: "wxyz"
};

lineSegments.slice(0, caseCount).forEach(function(currentCaseLine) {
    const digitSequence = currentCaseLine.split("").map(Number);

    const finalAccumulation = digitSequence.reduce(function(accumulator, currentDigitValue) {
        if (currentDigitValue > 0) {
            const nextCharPosition = accumulator.charPosition + 1;
            const charSetString = characterMappings[currentDigitValue];
            const selectedCharacter = charSetString[nextCharPosition % charSetString.length];
            return {
                ...accumulator,
                currentSelection: selectedCharacter,
                charPosition: nextCharPosition
            };
        } else {
            return {
                finalOutput: accumulator.finalOutput + accumulator.currentSelection,
                currentSelection: "",
                charPosition: -1
            };
        }
    }, { finalOutput: "", currentSelection: "", charPosition: -1 });

    console.log(finalAccumulation.finalOutput);
});
