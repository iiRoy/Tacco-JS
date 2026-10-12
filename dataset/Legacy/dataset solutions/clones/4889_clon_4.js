function processInput(rawInputText) {
    const inputLines = rawInputText.split("\n");
    const requiredCombinedLength = Number(inputLines[0]);
    const firstStringSegment = inputLines[1];
    const secondStringSegment = inputLines[2];

    const firstSegmentLength = firstStringSegment.length;
    const secondSegmentLength = secondStringSegment.length;
    const maxPossibleMatchLength = Math.min(firstSegmentLength, secondSegmentLength);

    const candidateMatchLengths = Array.from({ length: maxPossibleMatchLength }, (_, index) => maxPossibleMatchLength - index);

    const determinedOverlapLength = candidateMatchLengths.find(currentLength => {
        const trailingPart = firstStringSegment.slice(-currentLength);
        const leadingPart = secondStringSegment.slice(0, currentLength);
        const lengthConditionSatisfied = firstSegmentLength + secondSegmentLength - currentLength >= requiredCombinedLength;
        return trailingPart === leadingPart && lengthConditionSatisfied;
    }) || 0;

    console.log(firstStringSegment.slice(0, firstSegmentLength - determinedOverlapLength) + secondStringSegment);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
