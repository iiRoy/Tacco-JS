"use strict"; // Enforce strict parsing and error handling

/*
 * This module processes input data to compute a specific value
 * based on a recursive structure representing a "burger" of various layers.
 */
function processApplication( inputDataString )
{
    // Split the entire input string by newline characters to get individual lines.
    const arrayOfLines = inputDataString.split("\n");

    // Parse the first line to extract two key numerical parameters.
    // The first number represents the initial depth or level.
    const initialDepth = parseInt(arrayOfLines[0].split(" ")[0]);
    // The second number represents the target position within the structure.
    const targetSpot = parseInt(arrayOfLines[0].split(" ")[1]);

    // Output the result of the main calculation function to the console.
    console.log( calculateEatenItems( initialDepth, targetSpot ) );
}

/**
 * Computes the total size (number of "items") of a burger structure at a given depth.
 * @param {number} currentDepth The depth of the burger layer.
 * @returns {number} The total count of items in the burger at this depth.
 */
function getTotalLayerSize( currentDepth )
{
    // The formula for total size is 2^(depth + 2) - 3.
    // This represents the total number of "buns" and "patties" at this level.
    return Math.pow( 2, currentDepth + 2 ) - 3;
}

/**
 * Determines the number of "patties" within a burger structure at a given depth.
 * @param {number} currentDepth The depth of the burger layer.
 * @returns {number} The count of patties at this specific depth.
 */
function getPattyCount( currentDepth )
{
    // The formula for patty count is 2^(depth + 1) - 1.
    // This function specifically counts the "meat" components.
    return Math.pow( 2, currentDepth + 1 ) - 1;
}

/**
 * Recursively calculates the number of "eaten items" up to a specified position
 * within a burger structure of a given depth.
 * @param {number} layerValue The current depth of the burger structure being considered.
 * @param {number} positionInLayer The specific position from the start of the current layer.
 * @returns {number} The count of "patties" encountered up to the given position.
 */
function calculateEatenItems( layerValue, positionInLayer )
{
    // Calculate the total size of the sub-burger (one level deeper).
    const sizeOfLowerLayer = getTotalLayerSize( layerValue - 1 );

    // Base case: If the layer value is 0, it means we are at the smallest component,
    // which is considered a single "patty".
    if ( layerValue === 0 )
    {
        return 1;
    }
    // If the position is 1 or less, no patty has been eaten yet (assuming 0-indexed bun).
    else if ( positionInLayer <= 1 )
    {
        return 0;
    }
    // If the position falls within the first half of the current layer (including the bun and lower layer).
    else if ( positionInLayer <= sizeOfLowerLayer + 1 )
    {
        // Recursively call for the lower layer, adjusting the position.
        // We subtract 1 from the position because the first item is a bun.
        return calculateEatenItems( layerValue - 1, positionInLayer - 1 );
    }
    // Otherwise, the position is in the second half, meaning we've passed the lower layer,
    // the middle patty, and potentially entered the upper lower layer.
    else
    {
        // Sum the patties from the full lower layer, the middle patty (1),
        // and the recursively calculated patties from the remaining part of the upper lower layer.
        return getPattyCount( layerValue - 1 ) + 1 + calculateEatenItems( layerValue - 1, positionInLayer - sizeOfLowerLayer - 2 );
    }
}

// Execute the main program by reading input from standard input.
// This line assumes the environment provides 'fs' module and '/dev/stdin' for input.
processApplication( require('fs').readFileSync('/dev/stdin', 'utf8') );