function calculateMismatchMetric(sourceMaterial) {
    const [primaryContent, secondaryContent, ..._] = sourceMaterial.split('\n');

    const primaryCodePoints = [...primaryContent];

    const disparityTotal = primaryCodePoints.reduce((accumulator, primaryChar, currentPosition) => {
        // Using String.prototype.charAt to access characters.
        // This method will throw a TypeError if 'secondaryContent' is undefined or null,
        // mirroring the behavior of the original code's 'slice' call on an undefined line.
        const secondaryChar = secondaryContent.charAt(currentPosition);
        return accumulator + (primaryChar !== secondaryChar ? 1 : 0);
    }, 0);

    return disparityTotal;
}

const receivedData = require("fs").readFileSync("/dev/stdin", "utf8");
const outcomeValue = calculateMismatchMetric(receivedData);
console.log(outcomeValue);