function getSpecificCharacter(sourceString) {
    const stringParts = sourceString.split(' ');
    const secondPart = stringParts[1];
    const firstCharOfSecondPart = secondPart[0];
    return firstCharOfSecondPart;
}

function processInputData(rawInputContent) {
    const inputLines = rawInputContent.split('\n');
    const firstRelevantLine = inputLines[0].trim();
    const targetCharacter = getSpecificCharacter(firstRelevantLine);
    const finalOutputString = `A${targetCharacter}C`;
    console.log(finalOutputString);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
