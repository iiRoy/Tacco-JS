function reconfigureText(sourceContent, oldPattern, newPattern) {
    const occurrenceIndex = sourceContent.indexOf(oldPattern);
    if (occurrenceIndex === -1) {
        return sourceContent;
    }
    const leadingPart = sourceContent.substring(0, occurrenceIndex);
    const trailingPart = sourceContent.substring(occurrenceIndex + oldPattern.length);
    return leadingPart + newPattern + reconfigureText(trailingPart, oldPattern, newPattern);
}

const obtainedFragments = [];

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (incomingBuffer) => {
    let processedContent = String(incomingBuffer);

    processedContent = reconfigureText(processedContent, '.', ' ');
    processedContent = reconfigureText(processedContent, ',', ' ');

    processedContent
        .split(' ')
        .filter(segmentItem => segmentItem.length > 2 && segmentItem.length < 7)
        .forEach(validSegment => obtainedFragments.push(validSegment));
});

process.stdin.on('end', () => {
    console.log(obtainedFragments.join(' '));
});