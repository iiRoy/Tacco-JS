function Main(sourceText) {
    const lines = sourceText.split("\n");
    const numberStrings = lines.filter((_, idx) => idx === 1)[0].match(/\d+/g);

    const dataLength = numberStrings.length;

    // This section mirrors the original's validation logic,
    // which ultimately does not affect the final output due to being overwritten.
    let validityIndicator = true; // Corresponds to original 'c' being 1 initially
    const MODULUS_CONSTANT = 1000000007;

    // Generate the sequence of values to check: N-1, N-3, ..., down to 0 or 1.
    // This replaces the outer for loop with its peculiar j-- inside.
    const valuesToExamine = Array.from({ length: Math.ceil(dataLength / 2) }, (_, index) => dataLength - 1 - (2 * index));

    valuesToExamine.forEach(targetValue => {
        // Use reduce for counting, replacing the inner for loop.
        const occurrenceCount = numberStrings.reduce((accumulator, currentString) => {
            return accumulator + (parseInt(currentString) === targetValue ? 1 : 0);
        }, 0);

        // Replicate the original's conditional checks.
        if (targetValue > 0 && occurrenceCount !== 2) {
            validityIndicator = false; // This variable is later ignored, mirroring original behavior.
        }
        if (targetValue === 0 && occurrenceCount !== 1) {
            validityIndicator = false; // This variable is later ignored, mirroring original behavior.
        }
        // The original code resets 'd' (occurrenceCount) to 0, which is naturally handled by reduce for each targetValue.
    });

    // The final calculation, which in the original code overwrites any previous 'c' value.
    // Using bitwise shift for floor division and direct multiplication for squaring.
    const halfLengthFloored = dataLength >> 1;
    const finalCalculatedValue = (halfLengthFloored * halfLengthFloored) % MODULUS_CONSTANT;

    console.log('%s', finalCalculatedValue);
}

function debug(){
	var input = document.getElementById("input").value;
	Main(input);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
