(function(inputSource){
    const LINE_DELIMITER = '\n';
    const VALUE_DELIMITER = ' ';
    const FILL_CHAR = '#';
    const EMPTY_CHAR = '.';

    const createRepeatedString = (charToRepeat, count) => {
        if (count <= 0) {
            return '';
        }
        return Array(count + 1).join(charToRepeat);
    };

    const generateFrameString = (frameWidth, frameHeight) => {
        const topBottomRowContent = createRepeatedString(FILL_CHAR, frameWidth);
        const middleDotsContent = createRepeatedString(EMPTY_CHAR, frameWidth - 2);
        const middleRowContent = FILL_CHAR + middleDotsContent + FILL_CHAR;

        let frameOutput = '';

        frameOutput += topBottomRowContent + LINE_DELIMITER;

        const intermediateRowsCount = frameHeight - 1;
        for (let k = 0; k < intermediateRowsCount; k++) {
            frameOutput += middleRowContent + LINE_DELIMITER;
        }

        frameOutput += topBottomRowContent + LINE_DELIMITER;

        frameOutput += LINE_DELIMITER;

        return frameOutput;
    };

    let allInputLines = inputSource.split(LINE_DELIMITER);

    for(let currentLineIndex = 0; currentLineIndex < allInputLines.length; currentLineIndex++){
        let lineData = allInputLines[currentLineIndex];
        let dimensionStrings = lineData.split(VALUE_DELIMITER);

        let currentWidth = Number(dimensionStrings[0]);
        let currentHeight = Number(dimensionStrings[1]);

        if(currentWidth === 0 && currentHeight === 0){
            return;
        }

        const constructedFrame = generateFrameString(currentWidth, currentHeight);
        console.log(constructedFrame);
    }
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
