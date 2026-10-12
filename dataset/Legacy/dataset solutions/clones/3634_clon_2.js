function ProcessContestRating(userScore) {
    // This function evaluates a given numerical score to determine a contest category.
    // It uses a series of conditional checks to output the corresponding category name.

    // First condition: Check if the score is below the threshold for the 'ABC' category.
    if (userScore < 1200) {
        // If the score is less than 1200, print 'ABC'.
        console.log('ABC');
    }

    // Second condition: Check if the score falls within the range for the 'ARC' category.
    // This range is from 1200 (inclusive) up to, but not including, 2800.
    if (userScore >= 1200 && userScore < 2800) {
        // If the score is within this specific range, print 'ARC'.
        console.log('ARC');
    }

    // Third condition: Check if the score is at or below the maximum for the 'AGC' category.
    // Note that this condition might overlap with previous ones depending on the input value.
    if (userScore <= 4208) {
        // If the score is 4208 or less, print 'AGC'.
        console.log('AGC');
    }
}

// The program starts by reading input from standard input.
// The input is expected to be a string, which is then passed to the main processing function.
ProcessContestRating(require("fs").readFileSync("/dev/stdin", "utf8"));
