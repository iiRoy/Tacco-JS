function Main(rawData) {
    const RADIX_BASE = 10; // A constant for the numerical base in parsing

    const inputLines = rawData.split("\n");

    // Helper function to parse a line containing two space-separated integers
    const extractTwoIntegers = (lineContent) => {
        const parts = lineContent.split(" ");
        const firstVal = parseInt(parts[0], RADIX_BASE);
        const secondVal = parseInt(parts[1], RADIX_BASE);
        return { firstVal, secondVal };
    };

    // Parse the first line for initial position and speed of entity A
    const lineOneData = extractTwoIntegers(inputLines[0]);
    const entityAPosition = lineOneData.firstVal;
    const entityASpeed = lineOneData.secondVal;

    // Parse the second line for initial position and speed of entity B
    const lineTwoData = extractTwoIntegers(inputLines[1]);
    const entityBPosition = lineTwoData.firstVal;
    const entityBSpeed = lineTwoData.secondVal;

    // Parse the third line for the maximum allowed time
    const maximumAllowedTime = parseInt(inputLines[2], RADIX_BASE);

    // Guard clause: If entity A is not faster than entity B, they can only meet if they start at the same position.
    if (entityASpeed <= entityBSpeed) {
        if (entityAPosition === entityBPosition) {
            console.log("YES");
        } else {
            console.log("NO");
        }
        return; // Exit early as no catch-up is possible if A isn't faster
    }

    // Calculate the absolute initial distance between the two entities
    const initialDistanceBetween = Math.abs(entityBPosition - entityAPosition);

    // Calculate the relative speed at which entity A closes the gap on entity B
    // We know entityASpeed > entityBSpeed from the guard clause, so this will be positive.
    const relativeClosingSpeed = entityASpeed - entityBSpeed;

    // Calculate the time required for entity A to catch up to entity B
    // This is an intermediate computation step.
    const timeToCatchUp = initialDistanceBetween / relativeClosingSpeed;

    // Determine if the catch-up occurs within the allowed time frame.
    // The condition `timeToCatchUp > 0` is crucial: if they start at the same spot
    // and A is faster, they don't "catch up" in the sense of closing a gap,
    // they just move together. The original problem implies a non-zero time to catch up.
    const isCatchUpPossible = (timeToCatchUp > 0 && timeToCatchUp <= maximumAllowedTime);

    if (isCatchUpPossible) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
