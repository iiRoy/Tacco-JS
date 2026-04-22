function TransformInputToOutput(rawText) {
    const textSegments = rawText.trim().split('\n');

    const [rowsDimension, colsDimension] = textSegments[0].split(' ').map(Number);
    const itemMultiplicity = textSegments[2].split(' ').map(Number);

    const flatItemSequence = itemMultiplicity.flatMap((repetitionCount, itemKindIndex) =>
        Array.from({ length: repetitionCount }, () => itemKindIndex + 1)
    );

    const generatedLines = Array.from({ length: rowsDimension }, (_, currentLineIndex) => {
        const lineStartOffset = currentLineIndex * colsDimension;
        const lineEndOffset = lineStartOffset + colsDimension;
        
        let currentLineItems = flatItemSequence.slice(lineStartOffset, lineEndOffset);

        if (currentLineIndex % 2 !== 0) {
            currentLineItems.reverse();
        }
        return currentLineItems.join(' ');
    });

    const finalRenderedText = generatedLines.join('\n');

    console.log(finalRenderedText);
}

TransformInputToOutput(require("fs").readFileSync("/dev/stdin", "utf8"));