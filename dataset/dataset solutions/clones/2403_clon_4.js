function Main(input) {
    const inputLines = input.split("\n");
    const [lengthStr, maxStepStr] = inputLines[0].split(" ");
    const totalLength = Number(lengthStr);
    const maxStep = Number(maxStepStr);
    const pathCharMap = inputLines[1];

    let outcome;

    if (totalLength <= maxStep) {
        outcome = totalLength;
    } else {
        // A generator function to determine the sequence of jumps
        function* generatePathSegments(startPoint, endPoint, maxAllowedJump, charValidityMap) {
            let currentPoint = startPoint;
            while (currentPoint < endPoint) {
                let chosenJump = 0;
                // Iterate from the largest possible jump down to 1
                for (let stepIncrement = maxAllowedJump; stepIncrement >= 1; stepIncrement--) {
                    const nextPoint = currentPoint + stepIncrement;
                    if (nextPoint > endPoint) {
                        continue; // Cannot jump beyond the end point
                    }
                    // Check if the landing spot is valid:
                    // If it's the final destination, it's always valid.
                    // Otherwise, check the character map at (endPoint - nextPoint).
                    // This corresponds to the original logic's S[N - presentIdx - i] check.
                    if (nextPoint === endPoint || charValidityMap[endPoint - nextPoint] === '0') {
                        chosenJump = stepIncrement;
                        break; // Found the largest valid jump, take it
                    }
                }

                if (chosenJump > 0) {
                    yield chosenJump; // Yield the jump length
                    currentPoint += chosenJump; // Advance the current position
                } else {
                    // No valid jump could be made from the current position
                    yield -1; // Signal that no path is possible
                    return; // Terminate the generator
                }
            }
        }

        const jumpSequenceGenerator = generatePathSegments(0, totalLength, maxStep, pathCharMap);
        const collectedSegments = [];
        let pathFound = true;

        // Consume the generator to build the path
        for (const segmentValue of jumpSequenceGenerator) {
            if (segmentValue === -1) {
                pathFound = false;
                break; // Path is impossible
            }
            collectedSegments.push(segmentValue);
        }

        if (pathFound) {
            outcome = collectedSegments.join(" ");
        } else {
            outcome = -1;
        }
    }

    console.log('%s', outcome);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
