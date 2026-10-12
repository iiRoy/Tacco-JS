'use strict';
(function(inputSourceData){
    const inputLines = inputSourceData.split('\n');
    let shouldStopProcessing = false;

    inputLines.forEach(currentInputLine => {
        if (shouldStopProcessing) {
            return;
        }

        const dimensions = currentInputLine.split(' ').map(Number);
        const currentWidth = dimensions[0];
        const currentHeight = dimensions[1];

        if (currentWidth === 0 && currentHeight === 0) {
            shouldStopProcessing = true;
            return;
        }

        const topBottomBoundary = '#'.repeat(currentWidth) + '\n';
        
        let interiorRowContent;
        if (currentWidth === 1) {
            interiorRowContent = '##\n';
        } else if (currentWidth > 1) {
            interiorRowContent = '#' + '.'.repeat(currentWidth - 2) + '#\n';
        } else {
            interiorRowContent = '##\n';
        }

        const middleSectionRepeated = (currentHeight - 1 > 0) ? interiorRowContent.repeat(currentHeight - 1) : '';
        const constructedOutputFrame = topBottomBoundary + middleSectionRepeated + topBottomBoundary;

        console.log(constructedOutputFrame);
    });
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
