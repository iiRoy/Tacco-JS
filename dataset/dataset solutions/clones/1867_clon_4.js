function performValidation(sourceMaterial) {
    const patternIdentifier = /^([^\n]*)\n(.*)$/s;
    const parsedSegments = sourceMaterial.match(patternIdentifier);

    const primaryString = parsedSegments[1];
    const secondaryString = parsedSegments[2];

    const primaryLength = primaryString.length;

    if (primaryLength > secondaryString.length) {
        return "No";
    }

    const primaryCharList = Array.from(primaryString);
    const secondaryCharList = Array.from(secondaryString);

    const comparisonOutcome = primaryCharList.every((charUnit, positionIndex) => {
        return charUnit === secondaryCharList[positionIndex];
    });

    const resultDictionary = new Map([
        [true, "Yes"],
        [false, "No"]
    ]);

    return resultDictionary.get(comparisonOutcome);
}

function orchestrateProcess(dataFetcher) {
    const acquiredContent = dataFetcher();
    const finalAssessment = performValidation(acquiredContent);
    console.log(finalAssessment);
}

orchestrateProcess(() => require("fs").readFileSync("/dev/stdin", "utf8"));