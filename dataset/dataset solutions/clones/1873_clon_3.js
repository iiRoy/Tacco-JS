function evaluateBookPurchase(programInputData) {
    // Split the entire input string into individual lines for easier processing.
    const inputLines = programInputData.split("\n");

    // Parse the first line to get the global parameters:
    // Number of books (N), Number of skill categories (M), Minimum required skill level (X).
    const [numBooksStr, numSkillCategoriesStr, requiredSkillLevelStr] = inputLines[0].split(' ');
    const totalBooks = parseInt(numBooksStr, 10);
    const skillCategoryCount = parseInt(numSkillCategoriesStr, 10);
    const skillGoalThreshold = parseInt(requiredSkillLevelStr, 10);

    // Initialize arrays to store book-specific data.
    const bookPrices = []; // Stores the cost of each book.
    const bookSkillContributions = []; // Stores skill levels provided by each book for all categories.

    // Iterate through the remaining lines to populate book data.
    // Each line represents a book: its price followed by its skill contributions.
    for (let currentLineIndex = 1; currentLineIndex < inputLines.length; currentLineIndex++) {
        // Skip empty lines that might appear at the end of input or due to formatting.
        if (!inputLines[currentLineIndex].trim()) {
            continue;
        }
        
        // Parse the current line: convert string parts to numbers.
        const lineValues = inputLines[currentLineIndex].split(' ').map(Number);
        
        // Extract the book's price (first element) and its skill contributions (rest of elements).
        const currentBookCost = lineValues[0];
        const skillsProvidedByBook = lineValues.slice(1); // Get all elements from the second one onwards.

        // Store the parsed data into our structured arrays.
        bookPrices.push(currentBookCost);
        bookSkillContributions.push(skillsProvidedByBook);
    }

    // Initialize the minimum cost found so far to a very large number (infinity).
    // This will be updated as we find valid combinations of books.
    let minimumAchievedCost = Number.POSITIVE_INFINITY;

    // The core logic involves checking all possible combinations of books.
    // We can represent each combination using a bitmask.
    // If we have N books, there are 2^N possible combinations (including buying no books).
    // A bitmask 'combinationMask' from 0 to (2^N - 1) represents a combination:
    // if the k-th bit of 'combinationMask' is set, the k-th book is selected for purchase.
    const totalCombinations = 1 << totalBooks; // Computes 2 raised to the power of totalBooks

    // Iterate through all possible book combinations.
    for (let combinationMask = 0; combinationMask < totalCombinations; combinationMask++) {
        let currentCombinationCost = 0;
        // Initialize an array to sum up skill levels for the current combination of books.
        // All skill categories start at 0 for this specific combination.
        const accumulatedSkillLevels = new Array(skillCategoryCount).fill(0);
        
        // Flag to track if the current combination of books meets all skill requirements.
        let meetsAllSkillGoals = true; // Assume true until proven otherwise.

        // Iterate through each individual book to see if it's part of the current combination.
        for (let bookIdx = 0; bookIdx < totalBooks; bookIdx++) {
            // Check if the 'bookIdx'-th bit is set in the current 'combinationMask'.
            // If ((combinationMask >> bookIdx) & 1) is true, it means the book at 'bookIdx' is selected.
            const isBookSelectedInCurrentCombination = ((combinationMask >> bookIdx) & 1) === 1;

            if (isBookSelectedInCurrentCombination) {
                // If the book is selected, add its cost to the current combination's total.
                currentCombinationCost += bookPrices[bookIdx];
                
                // Add its skill contributions to the accumulated skill levels for each category.
                for (let skillIdx = 0; skillIdx < skillCategoryCount; skillIdx++) {
                    accumulatedSkillLevels[skillIdx] += bookSkillContributions[bookIdx][skillIdx];
                }
            }
        }

        // After evaluating all books for the current combination, check if it's valid.
        // A combination is valid if all skill categories meet or exceed the required threshold.
        for (let skillIdx = 0; skillIdx < skillCategoryCount; skillIdx++) {
            if (accumulatedSkillLevels[skillIdx] < skillGoalThreshold) {
                meetsAllSkillGoals = false; // This combination is not valid because one skill is too low.
                break; // No need to check further skill categories for this combination.
            }
        }

        // If the combination is valid (all skill goals are met),
        // check if its cost is lower than our current minimum found so far.
        if (meetsAllSkillGoals) {
            // If this combination is cheaper and valid, update the minimum cost.
            if (currentCombinationCost < minimumAchievedCost) {
                minimumAchievedCost = currentCombinationCost;
            }
        }
    }

    // Determine the final output.
    // If minimumAchievedCost is still Number.POSITIVE_INFINITY, it means no valid combination
    // of books was found that satisfies all skill requirements. In that case, output -1.
    // Otherwise, output the lowest cost found among all valid combinations.
    const finalResult = (minimumAchievedCost === Number.POSITIVE_INFINITY) ? -1 : minimumAchievedCost;
    console.log(finalResult);
}

// This line handles reading input from standard input and passing it to our function.
// It should not be modified for competitive programming environments.
evaluateBookPurchase(require("fs").readFileSync("/dev/stdin", "utf8"));