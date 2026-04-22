function ProcessInputData( externalSource ) {
    const rawContent = externalSource.split('\n');
    const primaryText = rawContent[0] || '';
    const secondaryText = rawContent[1] || '';

    const maxSegmentLength = Math.max(primaryText.length, secondaryText.length);

    const interleavedSegments = Array.from({ length: maxSegmentLength }, (_, index) => {
        const firstChar = index < primaryText.length ? primaryText[index] : undefined;
        const secondChar = index < secondaryText.length ? secondaryText[index] : undefined;
        return [firstChar, secondChar];
    });

    const finalSequence = interleavedSegments.flatMap(segmentPair => 
        segmentPair.filter(character => character !== undefined)
    );

    console.log(finalSequence.join(''));
}

ProcessInputData( require('fs').readFileSync('/dev/stdin', 'utf8') );