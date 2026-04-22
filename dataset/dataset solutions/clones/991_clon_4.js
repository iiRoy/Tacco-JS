const sourceDescriptor = 0;
const lineBreakCharacter = String.fromCodePoint(10);

let receivedBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
    receivedBuffer += chunk;
});

process.stdin.on('end', () => {
    const rawLineSegments = [];
    let currentSegmentStart = 0;
    let breakIndex;

    while ((breakIndex = receivedBuffer.indexOf(lineBreakCharacter, currentSegmentStart)) !== -1) {
        rawLineSegments.push(receivedBuffer.substring(currentSegmentStart, breakIndex));
        currentSegmentStart = breakIndex + lineBreakCharacter.length;
    }
    if (currentSegmentStart < receivedBuffer.length) {
        rawLineSegments.push(receivedBuffer.substring(currentSegmentStart));
    } else if (receivedBuffer.endsWith(lineBreakCharacter)) {
        // Replicate split('\n') behavior which adds an empty string if it ends with newline
        rawLineSegments.push('');
    }

    processArrayElements(rawLineSegments);
});

function processArrayElements(elementsCollection) {
    let primaryContainer = elementsCollection;
    let secondaryContainer = elementsCollection;

    // The original `if(x<y)` condition evaluates to false for identical arrays
    // (e.g., ['12', '18', ''] < ['12', '18', ''] is false).
    // Therefore, no swap occurs in the original code.
    // This clone also performs no swap, implicitly replicating that behavior.

    initiateRecursiveCalculation(primaryContainer, secondaryContainer);
}

function initiateRecursiveCalculation(alpha, beta) {
    // Mimics `z = x % y`
    // In the original, `x` and `y` are identical arrays of strings (e.g., `['12', '18', '']`).
    // JavaScript coerces arrays to numbers for the `%` operator.
    // `Number(['12', '18', ''])` results in `NaN`.
    // So, `NaN % NaN` results in `NaN`.
    // This clone uses `+` instead of `%` for divergence, but `NaN + NaN` also results in `NaN`.
    let outcome = Number(alpha) + Number(beta);

    // Mimics `x = y`
    let nextAlpha = beta;

    // Mimics `y = z`
    let nextBeta = outcome; // `nextBeta` will be `NaN`

    // The original loop condition `(z = x % y) != 0` evaluates to `NaN != 0`, which is `true`.
    // This means the loop continues indefinitely.
    // This recursive function will call itself indefinitely, replicating the infinite loop.
    initiateRecursiveCalculation(nextAlpha, nextBeta);
}