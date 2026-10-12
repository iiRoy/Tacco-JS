function ProcessInput(rawData) {
    // Process the incoming text data
    rawData = rawData.split("");

    // Create a frequency map for characters
    let charCounts = [];

    // Iterate through each character in the input
    for (let idx = 0; idx < rawData.length; idx++) {
        const currentCharacter = rawData[idx];
        if (charCounts[currentCharacter]) {
            // Increment count if character already seen
            charCounts[currentCharacter]++;
        } else {
            // Initialize count for new character
            charCounts[currentCharacter] = 0b1; // Using binary literal for 1
        }
    }

    // Determine if all character counts are even
    let isEvenlyDistributed = !0; // Using !0 for true

    // Check each character's frequency
    Object.keys(charCounts).forEach(function(charKey) {
        if (charCounts[charKey] % 2 === 0b1) { // Check for odd count
            isEvenlyDistributed = !1; // Using !1 for false
        }
    });

    // Output the result based on the flag
    if (isEvenlyDistributed) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

// Read input from standard input and pass to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
