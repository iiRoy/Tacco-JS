var rawText = require('fs').readFileSync('/dev/stdin', 'utf8');

// The raw text content is split into individual rows.
var contentRows = rawText.split('\n');

/*
 * Initialize an array to store the costs of primary items.
 * This array will hold numeric values derived from the input lines.
 */
var itemExpenses = [  ];

// Initialize a separate array for beverage costs.
var drinkExpenses = [ ];


// Parse and store the first three item costs from the input rows.
itemExpenses[0] = Number(contentRows[0]);
itemExpenses[1] = Number(contentRows[1]);
itemExpenses[2] = Number(contentRows[2]);

// Parse and store the next two beverage costs.
drinkExpenses[0] = Number(contentRows[3]);
drinkExpenses[1] = Number(contentRows[4]);


// Calculate the total minimum cost.
// Find the lowest price among primary items, and the lowest among beverages.
// Sum these two minimums and then subtract a fixed discount value of 50.
console.log(  Math.min.apply(null, itemExpenses) + Math.min.apply(null, drinkExpenses) - 50  );