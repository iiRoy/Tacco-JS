'use strict';
(function(dataStream) {
    const boundaryMark = '#';
    const voidMark = '.';
    const rowSeparator = '\n';

    // Helper to mimic Array(count).join(character) behavior precisely
    const arrayJoinMimic = (count, character) => {
        if (count <= 0) return '';
        // Array(1).join(char) is '', Array(2).join(char) is char, Array(N).join(char) is char.repeat(N-1)
        if (count === 1) return '';
        return character.repeat(count - 1);
    };

    // Generates the full rectangular visual construct
    const visualConstructGenerator = (horizontalSpan, verticalSpan) => {
        // Original: var clog = new Array(x+1).join('#')+'\n';
        const topRowContent = arrayJoinMimic(horizontalSpan + 1, boundaryMark);
        const borderLineWithBreak = topRowContent + rowSeparator;

        // Original: var clearance = '#'+(new Array(x - 1).join('.')+('#')+'\n');
        const innerRowPattern = boundaryMark + arrayJoinMimic(horizontalSpan - 1, voidMark) + boundaryMark;
        const innerLineWithBreak = innerRowPattern + rowSeparator;

        // Original: var frame = clog + (new Array(y-1).join(clearance))+clog;
        let finalDisplay = borderLineWithBreak;

        if (verticalSpan > 1) {
            // Original: new Array(y-1).join(clearance)
            finalDisplay += arrayJoinMimic(verticalSpan - 1, innerLineWithBreak);
        }
        finalDisplay += borderLineWithBreak;

        return finalDisplay;
    };

    // Parses raw input into dimension pairs, stopping at 0 0
    function* dimensionParser(rawTextualInput) {
        // The original code does not trim the input, so a trailing newline
        // results in an empty string segment, which parses as (0,0) dimensions.
        const segments = rawTextualInput.split(rowSeparator);
        for (const segment of segments) {
            const components = segment.split(' ');
            const hSpan = Number(components[0]);
            const vSpan = Number(components[1]);

            if (hSpan === 0 && vSpan === 0) {
                return; // Halt predicate met, terminate sequence processing
            }
            yield {
                horizontalSpan: hSpan,
                verticalSpan: vSpan
            };
        }
    }

    // Main execution flow
    for (const dimensions of dimensionParser(dataStream)) {
        const renderedOutput = visualConstructGenerator(dimensions.horizontalSpan, dimensions.verticalSpan);
        console.log(renderedOutput);
    }

}(require('fs').readFileSync('/dev/stdin', 'utf8')));