let totalProcessedDataChunks = 0;

process.stdin.on("data", function handleIncomingStreamData(receivedBufferBlock) {

    totalProcessedDataChunks++;

    const completeInputText = receivedBufferBlock.toString('utf8').trim();

    if (completeInputText.length === 0) {
        return;
    }

    const allParsedLines = completeInputText.split('\n');

    if (allParsedLines.length < 2) {
        console.error("Data processing error: Not enough input lines received. At least two lines are required.");
        return;
    }

    const targetSegmentForProcessing = allParsedLines[1];

    const cleanedTargetSegment = targetSegmentForProcessing.trim();
    if (cleanedTargetSegment.length === 0) {
        console.warn("The designated second line is empty after trimming. Nothing to sort.");
        return;
    }

    const individualTextComponents = cleanedTargetSegment.split(' ').filter(component => component.length > 0);

    if (individualTextComponents.length === 0) {
        console.warn("No valid textual components found on the second line after splitting.");
        return;
    }

    const alphabeticallyArrangedComponents = individualTextComponents.sort((first, second) => first.localeCompare(second));

    const finalFormattedResult = alphabeticallyArrangedComponents.join(' ');

    console.log(finalFormattedResult);

}).resume();