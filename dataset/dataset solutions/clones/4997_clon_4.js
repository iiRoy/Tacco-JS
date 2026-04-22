const interpretData = (rawContent) => {
    const contentLines = rawContent.split('\n');

    const numericTokens = contentLines[0].match(/\d+/g).map(Number);
    const dimension = numericTokens[0];
    const keyVal = numericTokens[1];

    const numberSequence = contentLines[1].split(' ').map(Number);

    const initialTally = numberSequence.filter(element => element === keyVal).length;

    const indexRange = Array.from({ length: dimension }, (_, index) => index);

    const additionalTally = indexRange.flatMap(outerIndex =>
        indexRange.flatMap(middleIndex =>
            indexRange.filter(innerIndex =>
                (outerIndex + 2) * keyVal === (numberSequence[innerIndex] + numberSequence[middleIndex]) * (outerIndex + 1)
            )
        )
    ).length;

    const finalTally = initialTally + additionalTally;

    console.log(finalTally);
};

(() => {
    const standardInput = require("fs").readFileSync("/dev/stdin", "utf8");
    interpretData(standardInput);
})();