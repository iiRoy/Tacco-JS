function processInputData(rawData) {
    const inputLines = rawData.split("\n");

    // The original code's calculation for 'titles' and 'sleptAt'
    // (var titles = lines.map(l => l.split(' ')[0]).splice(1, lines.length - 3);
    // var sleptAt = titles.indexOf(lines[lines.length - 2]);)
    // consistently results in 'sleptAt' being -1.
    // This is because lines[lines.length - 2]'s title is never present
    // in the 'titles' array as constructed by splice.
    // Therefore, the loop's starting index (sleptAt + 2) always evaluates to 1.
    // This redundant computation is removed to simplify the code while
    // preserving the exact observable behavior.

    let totalDuration = 0;

    // Define the loop's upper bound as a constant for clarity.
    // The original loop condition was 'i < lines.length - 2'.
    const loopEndIndexExclusive = inputLines.length - 2;

    // The loop starts from index 1 (equivalent to sleptAt + 2 where sleptAt is -1)
    // and iterates up to, but not including, loopEndIndexExclusive.
    for (let lineIndex = 1; lineIndex < loopEndIndexExclusive; lineIndex++) {
        const currentLineContent = inputLines[lineIndex];
        const lineSegments = currentLineContent.split(' ');

        // Extract the numeric part from the second segment
        const durationText = lineSegments[1];
        const numericDuration = Number(durationText);

        totalDuration += numericDuration;
    }

    console.log(totalDuration);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
