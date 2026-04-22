/*
 * This module provides utility functions for generating HTML lists
 * and handling string repetitions.
 */

// Function to duplicate a given string a specified number of times efficiently.
function replicateString(sourceText,   repetitions) {
  // If the repetition count is zero or negative, return an empty string.
  if (repetitions < 1) {
    return '';
  }

  // Initialize an empty string to accumulate the result.
  let finalString = '';

  // Use binary exponentiation (doubling) for efficient string repetition.
  while (repetitions > 0) {
    // If the least significant bit of 'repetitions' is 1, append the current sourceText.
    if (repetitions & 1) {
      finalString += sourceText;
    }

    // Right-shift 'repetitions' by 1 (equivalent to integer division by 2).
    // Double the sourceText for the next iteration.
    repetitions >>= 1;
    sourceText += sourceText;
  }

  // Return the accumulated string.
  return finalString;
}

// Function to recursively construct an HTML unordered list (UL) from a nested data structure.
function buildMarkupList(
  inputTree, // The data structure (object or array) to convert.
  currentNesting, // The current nesting level for indentation.
  useAbsoluteLinks // Flag indicating whether to use actual URLs or '#' placeholders.
) {
  // Ensure currentNesting has a valid starting value (default to 1 if invalid or 0).
  currentNesting = (isNaN(currentNesting) || currentNesting === 0) ? 1 : currentNesting;

  let markupBuffer = ''; // Buffer to store the generated HTML.
  // Generate indentation prefixes for the current level and child level.
  const currentIndent = replicateString('    ', currentNesting); // Using 4 spaces instead of tab
  const childIndent = replicateString('    ', currentNesting + 1);

  // Iterate over the keys/properties of the input data structure.
  for (const elementKey in inputTree) {
    // Start a new list item.
    markupBuffer += currentIndent + '<li>';

    // Determine if the key is numeric (indicating an array-like structure).
    const isNumericIndex = (parseInt(elementKey, 10) == elementKey); // Base 10 for parseInt
    // Set the display label based on whether it's an array index or an object key.
    const displayCaption = isNumericIndex ? inputTree[elementKey] : elementKey;

    // Determine the target URL for the link.
    // If useAbsoluteLinks is true, pick a random URL from availableURLs; otherwise, use '#'.
    const targetURL = useAbsoluteLinks
      ? availableURLs[Math.floor(Math.random() * availableURLs.length)]
      : '#';

    // If targetURL is '#', the label remains as is; otherwise, it's 'Google'.
    const linkText = targetURL === '#' ? displayCaption : 'Google';

    // Append the anchor tag to the markup buffer.
    markupBuffer += '<a href="' + targetURL + '">' + linkText + '</a>';

    // If the current element is a nested object (not an array-like index),
    // recursively build a sub-list.
    if (!isNumericIndex) {
      markupBuffer += '\n' + childIndent + '<ul>\n'; // Open nested UL
      // Recursive call for the sub-data. Increase nesting level by 2 for deeper indentation.
      markupBuffer += buildMarkupList(inputTree[elementKey], currentNesting + 2, useAbsoluteLinks);
      markupBuffer += childIndent + '</ul>\n' + currentIndent; // Close nested UL
    }

    markupBuffer += '</li>\n'; // Close the list item.
  }

  return markupBuffer; // Return the final HTML string.
}

// Global data structure representing the site navigation menu.
const menuHierarchy = {
  "0": "Home",
  "News and Events": [
    "Hot News",
    "RSS Feeds",
    "Peach Events",
    "User Groups"
  ],
  "About": {
    "Contact Us": [
      "Support and Service",
      "Product Feedback",
      "Website Feedback"],
    "0": "Public Relations",
    "1": "Investors",
    "2": "Working at Peach",
    "3": "Environment",
    "Working with Peach": [
      "Procurement",
      "Supplier Responsibility"
    ]
  },
  "Where to Buy": [
    "Where can I buy Peach products?",
    "Peach Online Store",
    "Peach Store for Business",
    "Peach Store for Education",
    "Peach Online Store Country Selector",
    "Peach Retail",
    "Find a Reseller",
    "Peach Financial Services", "Peach Rebates"
  ]
};

// Global array of possible URLs to be used for links.
const availableURLs = [
  'http://www.google.com',
  '#'
];