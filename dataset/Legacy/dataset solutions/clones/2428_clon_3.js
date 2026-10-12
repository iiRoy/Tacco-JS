function processInput(inputData) {
    const inputLines = inputData.split("\n");
    const numValueStr = inputLines[0];
    const mainString = inputLines[1];

    const numValue = parseInt(numValueStr, 10);

    // The original condition `!N % 2 === 0` always evaluates to `false` for any integer N.
    // This means the `if` block was effectively dead code and the program always
    // proceeded to the `else` block. We remove this dead code to simplify,
    // preserving the exact observable behavior.

    const segmentLength = Math.floor(numValue / 2); // Replicate substr's integer conversion for length

    // Replace the loop with direct substring extractions
    const firstSegment = mainString.substring(0, segmentLength);
    // For the second segment, replicate substr(start, length) behavior:
    // start is segmentLength, length is segmentLength.
    // substring(start, end) where end = start + length.
    const secondSegment = mainString.substring(segmentLength, segmentLength + segmentLength);

    const areSegmentsIdentical = (firstSegment === secondSegment);

    if (areSegmentsIdentical) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
