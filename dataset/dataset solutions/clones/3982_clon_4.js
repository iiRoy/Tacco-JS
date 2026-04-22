function dataProcessor(dataPayload) {
    let firstNewlineLocator = dataPayload.indexOf('\n');
    let secondNewlineLocator = -1;
    if (firstNewlineLocator !== -1) {
        secondNewlineLocator = dataPayload.indexOf('\n', firstNewlineLocator + 1);
    }
    let thirdNewlineLocator = -1;
    if (secondNewlineLocator !== -1) {
        thirdNewlineLocator = dataPayload.indexOf('\n', secondNewlineLocator + 1);
    }

    let initialSectionContent = null;
    if (firstNewlineLocator === -1) {
        initialSectionContent = dataPayload;
    } else {
        initialSectionContent = dataPayload.substring(0, firstNewlineLocator);
    }

    let middleSectionContent = null;
    if (firstNewlineLocator !== -1) {
        if (secondNewlineLocator === -1) {
            middleSectionContent = dataPayload.substring(firstNewlineLocator + 1);
        } else {
            middleSectionContent = dataPayload.substring(firstNewlineLocator + 1, secondNewlineLocator);
        }
    }

    let finalSectionContent = null;
    if (secondNewlineLocator !== -1) {
        if (thirdNewlineLocator === -1) {
            finalSectionContent = dataPayload.substring(secondNewlineLocator + 1);
        } else {
            finalSectionContent = dataPayload.substring(secondNewlineLocator + 1, thirdNewlineLocator);
        }
    }

    function retrieveSpecificCharacter(sourceMaterial, ordinalPosition) {
        if (sourceMaterial === null) {
            return null;
        }
        return sourceMaterial[ordinalPosition];
    }

    let firstDesignatedCharacter = retrieveSpecificCharacter(initialSectionContent, 0);
    let secondDesignatedCharacter = retrieveSpecificCharacter(middleSectionContent, 1);
    let thirdDesignatedCharacter = retrieveSpecificCharacter(finalSectionContent, 2);

    let outputSegmentA = (firstDesignatedCharacter === null) ? firstDesignatedCharacter.toString() : firstDesignatedCharacter;
    let outputSegmentB = (secondDesignatedCharacter === null) ? secondDesignatedCharacter.toString() : secondDesignatedCharacter;
    let outputSegmentC = (thirdDesignatedCharacter === null) ? thirdDesignatedCharacter.toString() : thirdDesignatedCharacter;

    console.log(outputSegmentA + outputSegmentB + outputSegmentC);
}

dataProcessor(require('fs').readFileSync('/dev/stdin', 'utf8'));