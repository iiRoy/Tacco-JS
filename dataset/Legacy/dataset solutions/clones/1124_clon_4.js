const printOutput = console.log;

if (typeof process !== "undefined") {
    let rawInputBuffer = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
        rawInputBuffer += chunk;
    });
    process.stdin.on('end', () => {
        const initialInputLines = rawInputBuffer.split("\n");
        processPolygonData(initialInputLines);
    });
}

function processPolygonData(initialInputLines) {
    // Parse input lines, replicating the original's behavior of converting to numbers
    // or cleaning strings if not numeric.
    const processedSegments = initialInputLines.map(currentLine => {
        const lineTokens = currentLine.split(" ").filter(token => token !== "");
        return lineTokens.map(token => {
            const numericValue = Number(token);
            // If the token is not a number, return the cleaned string (without \r or \n).
            // This preserves the original's behavior where non-numeric input could be passed through.
            return isNaN(numericValue) ? token.replace(/(\r)|(\n)/g, "") : numericValue;
        });
    });

    // Replicate the original's handling of the last line:
    // if it's a valid two-element array, it's kept. Otherwise, it's discarded.
    let finalInputSegment = processedSegments.pop();
    if (finalInputSegment && finalInputSegment.length === 2) {
        processedSegments.push(finalInputSegment);
    }

    // Replicate the original's removal of the first line (often a count, but not used).
    processedSegments.shift();

    // The array of vertex coordinates, potentially containing non-numeric values
    // if the input was malformed, matching original behavior.
    const polygonVertices = processedSegments;

    const vertexCount = polygonVertices.length;

    // Calculate the signed area using the standard shoelace formula.
    // This is a different implementation strategy from the original's fixed pivot point.
    // The formula is 0.5 * sum((x_i * y_{i+1}) - (x_{i+1} * y_i))
    // where (x_n, y_n) is (x_0, y_0) for the last term.
    const accumulatedSignedSum = polygonVertices.reduce((currentSum, currentVertex, index) => {
        // If the sum has already become NaN due to non-numeric input, propagate NaN.
        if (isNaN(currentSum)) {
            return NaN;
        }

        const nextVertexIndex = (index + 1) % vertexCount; // Wraps around for the last vertex
        const nextVertex = polygonVertices[nextVertexIndex];

        // JavaScript's arithmetic operations will handle potential non-numeric values
        // by coercing them to NaN, replicating the original's behavior.
        const termContribution = (currentVertex[0] * nextVertex[1]) - (nextVertex[0] * currentVertex[1]);
        
        return currentSum + termContribution;
    }, 0);

    const calculatedAreaValue = accumulatedSignedSum / 2;

    // Format the output to one decimal place without rounding,
    // and handle NaN explicitly, matching the original's string manipulation.
    let formattedOutputString;

    if (isNaN(calculatedAreaValue)) {
        formattedOutputString = "NaN.0";
    } else {
        // Truncate to one decimal place without rounding.
        // This is a different approach than string slicing.
        const scaledForTruncation = Math.trunc(calculatedAreaValue * 10);
        const integerPart = Math.trunc(scaledForTruncation / 10);
        const fractionalDigit = Math.abs(scaledForTruncation % 10);

        formattedOutputString = `${integerPart}.${fractionalDigit}`;
    }

    printOutput(formattedOutputString);
}
