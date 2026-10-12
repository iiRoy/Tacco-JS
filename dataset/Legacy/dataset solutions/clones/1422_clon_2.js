process.stdin.on("data", function(inputBuffer) {
    // Convert the incoming data chunk to a string, remove any leading or trailing whitespace,
    // then split it into an array of individual characters.
    let processedString = String(inputBuffer).trim().split("").map(function(singleCharacter, charIndex) {
        // Get the Unicode value of the current character.
        // The 'charIndex' parameter is part of the map callback signature but is not used in this logic.
        let charCodeValue = singleCharacter.charCodeAt(0);

        // Apply case swapping logic:
        // If the character is a lowercase letter (a-z), convert it to uppercase.
        // Else if it's an uppercase letter (A-Z), convert it to lowercase.
        // Otherwise, keep the character unchanged.
        return String.fromCharCode(
            (charCodeValue >= 97 && charCodeValue <= 122) ? charCodeValue - 32 : // Lowercase to uppercase
            (charCodeValue >= 65 && charCodeValue <= 90) ? charCodeValue + 32 : // Uppercase to lowercase
            charCodeValue // Other characters remain as they are
        );
    }).join(""); // Join the processed characters back into a single string.

    // Print the final modified string to the console.
    console.log(processedString);
}).resume(); // Activate the standard input stream to begin receiving data.
