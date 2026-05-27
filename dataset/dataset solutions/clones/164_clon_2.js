const fileSystem = require("fs"); // Acquire the Node.js file system module

fileSystem.readFileSync("/dev/stdin", "utf8") // Read all data from standard input as UTF-8 text
    .split('\n') // Divide the input content into an array of lines
    .map(function(currentInputLine) { // Process each individual line from the input
        // Loop through 26 possible transformation multipliers (from 25 down to 0)
        for (let firstFactor = 26; firstFactor--;) {
            // Loop through 26 possible additive shifts (from 25 down to 0)
            for (let secondFactor = 26; secondFactor--;) {
                // Generate a new string by applying a character-level substitution
                let alteredString = currentInputLine.replace(/[\w]/g, function(singleChar) {
                    // Calculate the new character code using a modular arithmetic cipher
                    // This assumes input characters are lowercase English letters (a-z)
                    return String.fromCharCode((singleChar.charCodeAt(0) * firstFactor + secondFactor) % 26 + 97);
                });

                // Check if the newly generated string contains the pattern "this" or "that"
                if (alteredString.match(/th(is|at)/)) {
                    // If the pattern is found, print the transformed string to the console
                    console.log(alteredString);
                } else {
                    // Otherwise, perform a no-operation to maintain the original's ternary structure
                    void 0;
                }
            }
        }
    });
