const processInputData = (inputContent) => {
    const inputLines = inputContent.trim().split('\n');

    // Custom helper to replicate Array(N).join(separator) behavior,
    // including its specific handling of N=0, N=1, and RangeError for N < 0.
    const replicateArrayJoin = (count, separator) => {
        if (count < 0) {
            throw new RangeError('Invalid array length');
        }
        if (count === 0 || count === 1) {
            return '';
        }
        let assembledString = '';
        for (let idx = 0; idx < count - 1; idx++) {
            assembledString += separator;
        }
        return assembledString;
    };

    for (const currentEntry of inputLines) {
        const dimensionParts = currentEntry.split(' ');
        const currentWidth = Number(dimensionParts[0]);
        const currentHeight = Number(dimensionParts[1]);

        if (currentWidth === 0 && currentHeight === 0) {
            return;
        }

        let topBottomBoundaryContent;
        try {
            // Original: new Array(x+1).join('#')
            topBottomBoundaryContent = replicateArrayJoin(currentWidth + 1, '#');
        } catch (error) {
            throw error;
        }

        let internalRowContent;
        try {
            // Original: '#'+(new Array(x - 1).join('.')+('#'))
            // This is where RangeError occurs if currentWidth - 1 is negative (i.e., currentWidth = 0).
            const dotSequence = replicateArrayJoin(currentWidth - 1, '.');
            internalRowContent = '#' + dotSequence + '#';
        } catch (error) {
            throw error;
        }

        const completeTopBottomLine = topBottomBoundaryContent + '\n';
        const completeInternalLine = internalRowContent + '\n';

        let finalOutputFrame = '';

        try {
            // Original: var frame = clog + (new Array(y-1).join(clearance))+clog+'\n';
            // Replicate the middle section using the custom helper.
            const middleFrameSection = replicateArrayJoin(currentHeight - 1, completeInternalLine);
            finalOutputFrame = completeTopBottomLine + middleFrameSection + completeTopBottomLine + '\n';
        } catch (error) {
            throw error;
        }

        console.log(finalOutputFrame);
    }
};

(function(dataSource) {
    processInputData(dataSource);
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
