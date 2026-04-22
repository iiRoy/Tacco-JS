/**
 * Replicates a given string segment a specified number of times.
 * This implementation uses a binary exponentiation (doubling) strategy
 * for efficient string concatenation.
 *
 * @param {string} baseSegment - The string fragment to be repeated.
 * @param {number} repetitions - The total count of times the segment should appear.
 * @returns {string} The final concatenated string.
 */
function replicateString(baseSegment, repetitions) {
    // Validate input: Ensure repetitions is a valid number.
    if (typeof repetitions !== 'number' || !Number.isFinite(repetitions)) {
        console.warn("Invalid 'repetitions' argument provided to replicateString. Defaulting to 0.");
        return '';
    }

    // If no repetitions or negative repetitions, return an empty string immediately.
    if (repetitions <= 0) {
        return '';
    }

    let finalOutput = ''; // Accumulator for the result.
    let currentSegment = baseSegment; // The segment to add in the current iteration.
    let remainingCount = Math.floor(repetitions); // Ensure integer count.

    // Loop while there are repetitions remaining.
    while (remainingCount > 0) {
        // If the least significant bit of remainingCount is 1,
        // it means we need to add the currentSegment to our result.
        if (remainingCount % 2 === 1) {
            finalOutput += currentSegment;
        }

        // Double the current segment for the next iteration.
        currentSegment += currentSegment;

        // Halve the remainingCount (integer division).
        remainingCount = Math.floor(remainingCount / 2);
    }

    return finalOutput;
}

/**
 * Generates HTML for a nested unordered list (UL) from a hierarchical data object.
 * Supports arbitrary nesting and dynamic link generation.
 *
 * @param {object} sourceData - The data object to convert into a list.
 * @param {number} [currentLevel=1] - The current indentation level, starting from 1.
 * @param {boolean} [useRealLinks=false] - If true, random external links are used; otherwise, '#' is used.
 * @returns {string} The generated HTML string for the UL.
 */
function generateNestedListHtml(sourceData, currentLevel = 1, useRealLinks = false) {
    // Ensure currentLevel is a positive number, default to 1 if invalid.
    const effectiveLevel = (typeof currentLevel !== 'number' || currentLevel < 1 || !Number.isFinite(currentLevel)) ? 1 : Math.floor(currentLevel);

    // If sourceData is not a valid object or is empty, return an empty string.
    if (typeof sourceData !== 'object' || sourceData === null || Object.keys(sourceData).length === 0) {
        return '';
    }

    // Determine indentation strings for the current and next levels.
    const indentCurrent = replicateString('\t', effectiveLevel);
    const indentNext = replicateString('\t', effectiveLevel + 1);

    // Use an array to build the HTML string for performance with many concatenations.
    const listMarkupSegments = [];

    // Iterate over the keys (properties) of the source data object.
    for (const itemKey in sourceData) {
        // Ensure the property belongs to the object itself, not its prototype chain.
        if (!Object.prototype.hasOwnProperty.call(sourceData, itemKey)) {
            continue;
        }

        listMarkupSegments.push(`${indentCurrent}<li>`);

        // Check if the key is numeric (indicating an array-like item).
        const isNumericKey = Number.isInteger(Number(itemKey));

        // Determine the text label to display for the list item.
        const displayLabel = isNumericKey ? sourceData[itemKey] : itemKey;

        // Determine the destination URL.
        let destinationUrl;
        if (useRealLinks && possibleDestinations && possibleDestinations.length > 0) {
            const randomIndex = Math.floor(Math.random() * possibleDestinations.length);
            destinationUrl = possibleDestinations[randomIndex];
        } else {
            destinationUrl = '#'; // Default fallback.
        }

        // Adjust the label if a real external link is used.
        const actualDisplay = (destinationUrl !== '#' && useRealLinks) ? `View: ${displayLabel}` : displayLabel;

        listMarkupSegments.push(`<a href="${destinationUrl}">${actualDisplay}</a>`);

        // If the current item's value is an object, recurse to create a nested list.
        if (typeof sourceData[itemKey] === 'object' && sourceData[itemKey] !== null) {
            listMarkupSegments.push(`\n${indentNext}<ul>\n`);
            // Recursive call for nested structure, increasing depth by 1 (original was +2, updated to +1 for standard nesting).
            listMarkupSegments.push(generateNestedListHtml(sourceData[itemKey], effectiveLevel + 1, useRealLinks));
            listMarkupSegments.push(`${indentNext}</ul>\n${indentCurrent}`);
        }

        listMarkupSegments.push('</li>\n');
    }

    return listMarkupSegments.join(''); // Join all segments into the final HTML string.
}

// --- Global Data Definitions ---

/**
 * Hierarchical data structure representing a menu or navigation links.
 * Keys can be strings for categories or numeric for individual items within arrays/objects.
 */
const menuItemsData = {
    "Homepage": "Main Portal", // Changed from "0": "Home"
    "News & Updates": [ // Changed from "News and Events"
        "Latest Articles", // Changed from "Hot News"
        "RSS Feeds",
        "Community Gatherings", // Changed from "Peach Events"
        "Interest Groups" // Changed from "User Groups"
    ],
    "Company Information": { // Changed from "About"
        "Contact Us": [
            "Customer Support", // Changed from "Support and Service"
            "Product Feedback",
            "Website Feedback"
        ],
        "0": "Corporate Relations", // Changed from "Public Relations"
        "1": "Investor Relations", // Changed from "Investors"
        "2": "Careers at Our Company", // Changed from "Working at Peach"
        "3": "Environmental Policy", // Changed from "Environment"
        "Partnering with Us": [ // Changed from "Working with Peach"
            "Procurement",
            "Supplier Responsibility"
        ],
        "Legal": "Terms and Conditions" // Added a new item
    },
    "Where to Acquire": [ // Changed from "Where to Buy"
        "Where can I find our products?", // Changed
        "Online Storefront", // Changed
        "Business Solutions", // Changed
        "Educational Programs", // Changed
        "International Store Selector", // Changed
        "Retail Locations", // Changed
        "Find a Distributor", // Changed
        "Financial Services",
        "Rebate Programs",
        "Special Offers" // Added a new item
    ]
};

/**
 * An array of potential URLs for dynamic link generation.
 */
const possibleDestinations = [
    'https://www.example.com/page1', // Changed from google.com
    'https://www.example.com/page2',
    'https://www.example.com/page3',
    '#' // Keep the hash for internal/placeholder links
];

// Example of how to use these functions (for context, not part of the clone output)
// const generatedHtml = generateNestedListHtml(menuItemsData, 1, true);
// document.getElementById('output').innerHTML = generatedHtml;