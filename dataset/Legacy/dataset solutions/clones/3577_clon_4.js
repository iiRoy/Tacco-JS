var p = require("fs").readFileSync("/dev/stdin", "utf8");
p = p.split("\n").map(a => +a);

console.log(validateSequence());

function validateSequence() {
    const sequenceData = p.slice(1); // 0-indexed array for p[1]...p[n]
    const sequenceLength = p[0];

    const endpointRegistry = new Set(); // Replaces 'a' object from original

    // Recursive function to process segments.
    // It simulates the inner 'while' loop of the original code.
    // Returns the next index to process (1-based) if successful, or -1 if validation fails.
    function processInnerSegment(currentPosition, segmentUpperBoundary, segmentLowerBoundary) {
        // Base case for the inner loop: currentPosition has reached or exceeded the segment's upper boundary.
        // This means the current segment is fully processed.
        if (currentPosition >= segmentUpperBoundary) {
            return currentPosition; // Return the current position, which is the start of the next potential segment.
        }

        // Simulate original: i++; if(p[i] !== i)return N;
        const nextPositionStep1 = currentPosition + 1;
        if (nextPositionStep1 > sequenceLength || sequenceData[nextPositionStep1 - 1] !== nextPositionStep1) {
            return -1; // Validation failed
        }

        // Simulate original: i++; if((p[i] ^ i) & 1)return N;
        const nextPositionStep2 = nextPositionStep1 + 1;
        if (nextPositionStep2 > sequenceLength || ((sequenceData[nextPositionStep2 - 1] ^ nextPositionStep2) & 1) !== 0) {
            return -1; // Validation failed
        }

        const valueAtNextPositionStep2 = sequenceData[nextPositionStep2 - 1];

        // Simulate original: if(u < p[i]){u = p[i]; a[u] = 1;}
        if (segmentUpperBoundary < valueAtNextPositionStep2) {
            if (endpointRegistry.has(valueAtNextPositionStep2)) {
                return -1; // 'u' value already registered as an endpoint, implies invalid structure
            }
            endpointRegistry.add(valueAtNextPositionStep2); // Register new 'u'
            // Recurse with the extended segment upper boundary
            return processInnerSegment(nextPositionStep2, valueAtNextPositionStep2, segmentLowerBoundary);
        }
        // Simulate original: else if(v === p[i]){ do{ v += 2; }while(a[v]) }
        else if (segmentLowerBoundary === valueAtNextPositionStep2) {
            let temporaryLowerBoundary = segmentLowerBoundary;
            // This loop simulates the original's behavior of finding the next available 'v'
            // without actually using its updated value for control flow. It's a side-effect-free check.
            while (endpointRegistry.has(temporaryLowerBoundary)) { // Original: a[v]
                temporaryLowerBoundary += 2;
            }
            // The original code discards the updated 'v' after the inner loop iteration.
            // So, we continue recursion with the original segmentUpperBoundary and segmentLowerBoundary.
            return processInnerSegment(nextPositionStep2, segmentUpperBoundary, segmentLowerBoundary);
        }
        // Simulate original: else return N;
        else {
            return -1; // Validation failed
        }
    }

    let currentOuterLoopIndex = 1; // Simulates 'i' in the outer for loop
    while (currentOuterLoopIndex <= sequenceLength) {
        const valueAtCurrentOuterIndex = sequenceData[currentOuterLoopIndex - 1];

        // Simulate original: if((p[i] ^ i) & 1)return N;
        if (((valueAtCurrentOuterIndex ^ currentOuterLoopIndex) & 1) !== 0) {
            return "No";
        }

        let currentSegmentUpper = valueAtCurrentOuterIndex; // Simulates 'u'
        const currentSegmentLower = currentOuterLoopIndex; // Simulates 'v'

        // Simulate original: a[u] = 1;
        if (endpointRegistry.has(currentSegmentUpper)) {
            return "No"; // This 'u' value was already an endpoint, implies invalid structure
        }
        endpointRegistry.add(currentSegmentUpper);

        // Call the recursive helper to process the inner segment, replacing the inner 'while' loop
        const nextIndexAfterInnerSegment = processInnerSegment(currentOuterLoopIndex, currentSegmentUpper, currentSegmentLower);

        if (nextIndexAfterInnerSegment === -1) {
            return "No"; // Inner segment validation failed
        }

        // The outer loop's 'i' is updated by the inner loop's progress.
        // The recursive function returns the index *after* the segment it processed.
        // Original: `i` becomes `innerLoopIdx` after the while loop, then `i++` for the for loop.
        // So, `currentOuterLoopIndex` should be set to `nextIndexAfterInnerSegment + 1`.
        currentOuterLoopIndex = nextIndexAfterInnerSegment + 1;
    }

    return "Yes";
}
