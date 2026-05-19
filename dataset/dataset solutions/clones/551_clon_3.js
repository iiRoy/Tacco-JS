((inputContent) => {
    const NEWLINE_DELIMITER = '\n';
    const SPACE_DELIMITER = ' ';

    const inputLines = inputContent.split(NEWLINE_DELIMITER);

    const parseNumericValue = (str) => parseInt(str, 10);

    const entryCount = parseNumericValue(inputLines[0]);

    const translationMap = {};

    for (let idx = 0; idx < entryCount; idx++) {
        const mapEntryLine = inputLines[1 + idx];
        const parts = mapEntryLine.split(SPACE_DELIMITER);
        const [originalKey, translatedValue] = parts;
        translationMap[originalKey] = translatedValue;
    }

    const segmentsStartIndex = 1 + entryCount + 1;

    const segmentsForProcessing = inputLines.slice(segmentsStartIndex);

    const processedSegments = [];

    const getTranslatedOrOriginal = (segment, dictionary) => {
        return dictionary.hasOwnProperty(segment) ? dictionary[segment] : segment;
    };

    for (const currentSegment of segmentsForProcessing) {
        const resolvedSegment = getTranslatedOrOriginal(currentSegment, translationMap);
        processedSegments.push(resolvedSegment);
    }

    const finalOutputString = processedSegments.join('');
    console.log(finalOutputString + NEWLINE_DELIMITER);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
