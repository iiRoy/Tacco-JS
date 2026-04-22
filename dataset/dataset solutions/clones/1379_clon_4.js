let acquiredData = '';
process.stdin.on('data', (portion) => {
    acquiredData += portion.toString();
});

process.stdin.on('end', () => {
    const entryRecords = acquiredData.trim().split('\n');

    const formTextSequence = (totalCount, characterUnit) => {
        let constructedText = '';
        for (let countIndex = 0; countIndex < totalCount; countIndex++) {
            constructedText += characterUnit;
        }
        return constructedText;
    };

    const sculptRectangle = (widthDimension, heightDimension) => {
        if (widthDimension === 0 && heightDimension === 0) {
            return null; // A special marker to halt processing
        }
        if (widthDimension < 1 || heightDimension < 1) {
            return ''; // Invalid dimensions, but not the halt condition
        }

        const horizontalBoundary = formTextSequence(widthDimension, '#') + '\n';

        let innerRegionRow;
        if (widthDimension <= 2) {
            // Replicates new Array(widthDimension - 1).join('.') producing '' for width 1 or 2
            innerRegionRow = '#' + formTextSequence(0, '.') + '#' + '\n'; // This results in '##\n'
        } else {
            innerRegionRow = '#' + formTextSequence(widthDimension - 2, '.') + '#' + '\n';
        }

        let graphicComposition = '';

        if (heightDimension === 1) {
            // Original: clog + '' + clog + '\n'
            graphicComposition = horizontalBoundary + horizontalBoundary + '\n';
        } else if (heightDimension === 2) {
            // Original: clog + '' + clog + '\n'
            graphicComposition = horizontalBoundary + horizontalBoundary + '\n';
        } else { // heightDimension > 2
            graphicComposition += horizontalBoundary;
            const middleSectionsCount = heightDimension - 2;
            for (let sectionIdx = 0; sectionIdx < middleSectionsCount; sectionIdx++) {
                graphicComposition += innerRegionRow;
            }
            graphicComposition += horizontalBoundary; // Add bottom border
            graphicComposition += '\n'; // The final trailing newline
        }

        return graphicComposition;
    };

    const collectedOutputs = [];
    let processingActive = true;

    for (const currentEntry of entryRecords) {
        if (!processingActive) break;

        const numericDimensions = currentEntry.split(' ').map(Number);
        const measureX = numericDimensions[0];
        const measureY = numericDimensions[1];

        const renderedVisual = sculptRectangle(measureX, measureY);

        if (renderedVisual === null) {
            processingActive = false; // Halt further processing
            continue;
        }
        if (renderedVisual !== '') {
            collectedOutputs.push(renderedVisual);
        }
    }

    collectedOutputs.forEach(outputSegment => console.log(outputSegment));
});