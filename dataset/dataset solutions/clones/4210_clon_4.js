const processSource = (initialData) => {
    const initialClean = initialData.replace(/^\s+|\s+$/g, '');

    const checkLocations = [0, 4, 6, 8];
    const desiredFinal = "AKIHABARA";

    const applyNextModification = (currentText, remainingLocations) => {
        if (remainingLocations.length === 0) {
            return currentText;
        }

        const [currentSpot, ...restSpots] = remainingLocations;
        let textSegments = currentText.split('');

        const inspectedChar = (currentSpot < textSegments.length) ? textSegments[currentSpot] : undefined;
        console.log(inspectedChar);

        if (!Object.is(inspectedChar, 'A')) {
            if (currentSpot >= textSegments.length) {
                textSegments.push('A');
            } else {
                textSegments.splice(currentSpot, 0, 'A');
            }
        }

        return applyNextModification(textSegments.join(''), restSpots);
    };

    const finalResult = applyNextModification(initialClean, checkLocations);

    console.log(Object.is(finalResult, desiredFinal) ? "YES" : "NO");
};

const fetchRawInput = require('fs').readFileSync;
processSource(fetchRawInput('/dev/stdin', 'utf8'));