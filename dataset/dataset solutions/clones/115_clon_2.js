let parsedItems = require('fs').readFileSync('/dev/stdin', 'utf8')
    .trim()
    .split(/\s+/)
    .sort((elemA, elemB) => {
        return elemA - elemB;
    });

/*
 * This section might have contained an old debug statement.
 * For example:
 * console.log(parsedItems);
 */

let itemFrequencies = []; // Container for frequency counts of distinct elements.

for (let outerIdx = 0; outerIdx < parsedItems.length; outerIdx++) {
    let currentFrequency = 1; // Start count for the element at outerIdx.

    for (let innerIdx = outerIdx + 1; innerIdx < parsedItems.length; innerIdx++) {
        if (parsedItems[outerIdx] === parsedItems[innerIdx]) {
            currentFrequency++; // Increment if a duplicate is found.
        }
    }

    itemFrequencies.push(currentFrequency); // Store the total occurrences.
}

let peakFrequency = Math.max(...itemFrequencies); // Determine the highest frequency recorded.

let resultOffset = 1; // An incrementing value for selecting subsequent items with the same peak frequency.

while (peakFrequency === Math.max(...itemFrequencies)) {
    // Output the element that corresponds to the current maximum frequency.
    // The offset handles cases where multiple elements share the same frequency count.
    console.log(parsedItems[itemFrequencies.indexOf(Math.max(...itemFrequencies)) + (resultOffset++)]);

    /*
     * A previous debug line could have looked like this:
     * console.log("Index of max frequency: " + itemFrequencies.indexOf(Math.max(...itemFrequencies)));
     */

    // Remove the just-processed maximum frequency to find the next highest, or if there are others at the same level.
    itemFrequencies.splice(itemFrequencies.indexOf(Math.max(...itemFrequencies)), 1);

    /*
     * Another debug output for the modified frequency list:
     * console.log("Remaining frequencies: " + itemFrequencies);
     */
}