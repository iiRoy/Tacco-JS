const fileSystem = require("fs");

const inputDataLines = fileSystem.readFileSync("/dev/stdin", "utf8").split('\n');

const affineParameters = Array.from({ length: 26 }, (_, tIndex) => 25 - tIndex)
    .flatMap(currentMultiplier =>
        Array.from({ length: 26 }, (_, sIndex) => 25 - sIndex)
            .map(currentShift => ({ multiplier: currentMultiplier, shift: currentShift }))
    );

const transformCharacter = (charToProcess, currentMultiplier, currentShift) => {
    if (!/[\w]/.test(charToProcess)) {
        return charToProcess;
    }
    const charCodeValue = charToProcess.charCodeAt(0);
    const newCharCodeValue = (charCodeValue * currentMultiplier + currentShift) % 26 + 97;
    return String.fromCharCode(newCharCodeValue);
};

inputDataLines.forEach(sourceLine => {
    affineParameters.forEach(params => {
        const { multiplier: currentT, shift: currentS } = params;

        const transformedLineCharacters = Array.from(sourceLine).map(charItem =>
            transformCharacter(charItem, currentT, currentS)
        );
        const processedString = transformedLineCharacters.join('');

        if (processedString.match(/th(is|at)/)) {
            console.log(processedString);
        }
    });
});
