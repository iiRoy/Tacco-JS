"use strict";

const fileSystem = require('fs');

/**
 * A utility function to safely convert a string to an integer.
 * It handles non-numeric inputs by returning 0, and ensures the result is an integer.
 * @param {string} inputString The string to be parsed.
 * @returns {number} The parsed integer value.
 */
function convertToInteger(inputString) {
    const numericValue = Number(inputString);
    // Return 0 for invalid numbers to ensure a safe default, otherwise return the floor of the number.
    return isNaN(numericValue) ? 0 : Math.floor(numericValue);
}

/**
 * Defines the classification tiers for scores. Each tier has an upper 'bound'
 * (exclusive) and a unique 'label'. The order of these definitions is crucial.
 */
const scoreTierDefinitions = [
    { bound: 400,  label: 'Category_Alpha' },
    { bound: 800,  label: 'Category_Beta' },
    { bound: 1200, label: 'Category_Gamma' },
    { bound: 1600, label: 'Category_Delta' },
    { bound: 2000, label: 'Category_Epsilon' },
    { bound: 2400, label: 'Category_Zeta' },
    { bound: 2800, label: 'Category_Eta' },
    { bound: 3200, label: 'Category_Theta' }
];

/**
 * Analyzes a set of rating scores to determine the minimum and maximum
 * possible counts of distinct active categories.
 * @param {string} rawDataInput - The entire raw input string, typically from stdin.
 */
const analyzeRatingScores = rawDataInput => {
    // Clean and split the input into individual lines.
    const inputLines = rawDataInput.trim().split('\n');

    // The first line often contains a total count (N), but it is not utilized
    // in the core logic for calculating category counts, so it is skipped.
    // const totalItemCount = convertToInteger(inputLines[0]); // Original N, not used.

    // Parse the second line which contains space-separated rating scores.
    // Filter out any empty strings that might result from multiple spaces.
    const individualScores = inputLines[1].split(' ').filter(s => s !== '').map(convertToInteger);

    // A Set is used to efficiently track unique categories that have been hit by scores.
    const activeCategoriesFound = new Set();
    // This counter keeps track of scores that exceed all defined category bounds.
    let excessScoreCount = 0;

    // Iterate through each score to assign it to a category or mark it as excess.
    for (const currentScoreValue of individualScores) {
        let scoreCategorized = false; // Flag to check if the current score found a category.
        for (const tierInfo of scoreTierDefinitions) {
            if (currentScoreValue < tierInfo.bound) {
                activeCategoriesFound.add(tierInfo.label);
                scoreCategorized = true;
                break; // Once a category is found, move to the next score.
            }
        }
        // If the score did not fit into any of the predefined tiers, it's an excess score.
        if (!scoreCategorized) {
            excessScoreCount++;
        }
    }

    // Determine the number of unique categories that were actually reached.
    const uniqueCategoryHitCount = activeCategoriesFound.size;

    // Calculate the minimum possible number of distinct categories.
    // Based on the original problem's logic, if no categories are explicitly hit,
    // the minimum is considered 1 (implying an item could still contribute to one category).
    const minimumDistinctCategories = uniqueCategoryHitCount === 0
        ? 1 // If no specific tiers are hit, min is still 1.
        : uniqueCategoryHitCount;

    // Calculate the maximum possible number of distinct categories.
    // This includes all unique categories hit plus any excess scores,
    // as each excess score could potentially represent a new, distinct category.
    const maximumDistinctCategories = uniqueCategoryHitCount + excessScoreCount;

    // Output the computed minimum and maximum counts, separated by a space.
    console.log(`${minimumDistinctCategories} ${maximumDistinctCategories}`);
};

// Initiate the analysis by reading input from standard input.
analyzeRatingScores(fileSystem.readFileSync('/dev/stdin', 'utf8'));