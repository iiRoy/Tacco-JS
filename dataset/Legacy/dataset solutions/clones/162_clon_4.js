const fileSystemModule = require("fs");
const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const targetLine = rawInputContent.split('\n').pop();

const affineParameterCombinations = Array.from({ length: 26 * 26 }, (_, iterationIndex) => ({
    coefficient: Math.floor(iterationIndex / 26),
    offset: iterationIndex % 26
}));

affineParameterCombinations.forEach(currentParameters => {
    const { coefficient, offset } = currentParameters;

    const characterSequence = targetLine.split('').map(sourceChar => {
        if (sourceChar.match(/[\w]/)) {
            const charNumericalValue = sourceChar.charCodeAt(0);
            const modifiedNumericalValue = (charNumericalValue * coefficient + offset) % 26 + 97;
            return String.fromCharCode(modifiedNumericalValue);
        }
        return sourceChar;
    });

    const resultantString = characterSequence.join('');

    if (resultantString.includes("this") || resultantString.includes("that")) {
        console.log(resultantString);
    }
});
