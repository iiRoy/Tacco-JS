let dataBuffer = '';
let dataPointer = 0;

function obtainValue(kind) {
    if (kind === 'text') {
        return dataBuffer[dataPointer++];
    } else {
        return +dataBuffer[dataPointer++];
    }
}

function displayResult(value) {
    console.log(value);
}

function processInputSequence() {
    while (true) {
        const currentSize = obtainValue();
        if (currentSize === 0) {
            break;
        }
        const windowExtent = obtainValue();

        const sourceArray = Array.from({ length: currentSize }, () => obtainValue());

        // Handle the case where windowExtent is greater than currentSize.
        // The original code would attempt to sum elements beyond the array's bounds,
        // resulting in `undefined + number`, which yields `NaN`.
        // This block replicates that specific behavior.
        if (windowExtent > currentSize) {
            let initialSumCheck = 0;
            for (let i = 0; i < windowExtent; i++) {
                initialSumCheck += sourceArray[i]; // Will correctly produce NaN if sourceArray[i] is undefined
            }
            displayResult(initialSumCheck);
            continue;
        }

        let overallMaximum = -Infinity;

        // Core sliding window logic: Substantially different implementation strategy.
        // Instead of maintaining and incrementally updating a running sum (O(N)),
        // this approach recalculates the sum for each possible window from scratch (O(N*K)).
        // This changes the algorithmic complexity but preserves the observable behavior.
        for (let startPosition = 0; startPosition <= currentSize - windowExtent; ++startPosition) {
            // Extract the current window as a slice of the source array.
            const currentWindow = sourceArray.slice(startPosition, startPosition + windowExtent);
            // Calculate the sum of elements within the current window using reduce.
            const currentWindowSum = currentWindow.reduce((accumulator, value) => accumulator + value, 0);
            // Update the overall maximum sum found so far.
            overallMaximum = Math.max(overallMaximum, currentWindowSum);
        }
        displayResult(overallMaximum);
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
    dataBuffer += chunk;
});

process.stdin.on('end', function() {
    dataBuffer = dataBuffer.split(/\s+/);
    processInputSequence();
});
