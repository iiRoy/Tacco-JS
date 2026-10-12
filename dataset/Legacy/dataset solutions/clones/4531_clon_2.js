function ProcessData(rawData) {
    // Split the input string by newline characters to get individual lines
    rawData = rawData.split('\x0A');

    // The first line (index 0) is the number of participants, but it's not used in the original logic.
    // We still parse it to maintain the original structure and potential side effects of Number() conversion.
    var participantCount = Number(rawData[0]);

    // The second line (index 1) contains space-separated scores
    var rawScores = rawData[1].split(' ');

    // This array will store the calculated levels for scores below the 'over eight' threshold
    var categoryLevels = [];

    // This variable will hold the current calculated level for each score
    var currentLevel = 0x0; // Using hexadecimal literal for 0

    // This counter tracks how many scores result in a level of 8 or higher
    var overEightCount = 0;

    // Iterate through each score in the rawScores array
    for (var idx = 0; idx < rawScores.length; idx++) {
        // Convert the current score string to a number
        rawScores[idx] = Number(rawScores[idx]);

        // Calculate the level by dividing the score by 400 and taking the floor
        currentLevel = Math.floor(rawScores[idx] / 4e2); // Using scientific notation for 400

        // Check if the calculated level is 8 or greater
        if (currentLevel >= 0o10) { // Using octal literal for 8
            // If it's 8 or more, increment the 'over eight' counter
            overEightCount++;
        } else {
            // Otherwise, add the level to our categoryLevels array
            categoryLevels.push(currentLevel);
        }
    }

    // Filter the categoryLevels array to get only unique level values
    // The filter function checks if the current item's first occurrence index matches its current index
    var uniqueLevels = categoryLevels.filter(function(item, index, arrayRef) {
        return arrayRef.indexOf(item) === index;
    });

    // Output the array of unique levels found (excluding those >= 8)
    console.log(uniqueLevels);

    // Determine and output the final counts based on whether unique levels were found
    if (uniqueLevels[0]) {
        // If there's at least one unique level, output its count and the total count including 'over eight'
        console.log(uniqueLevels.length + ' ' + (uniqueLevels.length + overEightCount));
    } else {
        // If no unique levels were found (meaning all scores were >= 8 or no scores),
        // output 1 (representing a base category) and the 'over eight' count
        console.log(0x1 + ' ' + overEightCount); // Using hexadecimal literal for 1
    }
}

// Read input from standard input and pass it to the main processing function
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
