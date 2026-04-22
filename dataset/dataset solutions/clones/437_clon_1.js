function howMuch( items, item, s ) {
  // Declare all local variables at the top of the function scope.
  var
    recipe,  // This variable will hold the recipe array if the item has one.
    price = items[item].price, // Initialize price with the direct cost of the item.
    sum,     // Used to accumulate the total cost of recipe components.
    flag = false, // A boolean flag to detect circular dependencies or successful recipe calculation.
    j;       // Loop counter for iterating through recipe components.

  // Ensure 's' is an array, initializing it if it's null or undefined.
  // 's' acts as a stack to keep track of items in the current dependency path.
  s = s || [ ];

  /*
   * The following line was a debug statement in the original code.
   * console.log(item, s); // This would print the current item and the dependency stack.
   */

  // Check if the current item has a recipe. The assignment happens within the condition.
  if ( recipe = items[item].recipe ) {
    s.push(item); // Add the current item to the dependency stack to detect cycles.
    sum = 0;      // Reset the sum for the new recipe calculation.
    flag = true;  // Assume no circular dependency until proven otherwise.

    // Iterate through each component required for the current item's recipe.
    for ( j = 0; j < recipe.length; j++ ) {
      // Check if the current recipe component is already in the dependency stack.
      if ( s.indexOf(recipe[j]) !== -1 ) {
        flag = false; // A circular dependency has been detected!
        break;        // No need to continue processing this recipe path.
      }
      // Recursively call howMuch for each recipe component and add its cost to the sum.
      sum += howMuch(items, recipe[j], s);
    }

    // If no circular dependency was found during the processing of this recipe.
    if (flag) {
      // Update the price to be the minimum of its direct price and the calculated recipe sum.
      price = min(price, sum);
    }

    s.pop(); // Remove the current item from the dependency stack as its processing is complete.
  }

  // Return the final calculated minimum price for the item.
  return price;
}


// A utility function to find the minimum of two numerical values.
function min( x, y ) {
  // Uses a ternary operator for a concise return of the smaller value.
  return x < y ? x : y;
}


// The main entry point function for processing the input and calculating prices.
function main() {
  // Declare variables used within the main function scope.
  var
    i,    // General-purpose loop counter and index for the input array.
    n,    // Stores the index marking the end of direct-priced items.
    m,    // Stores the index marking the end of recipe-defined items.
    line, // An array to hold parts of a split input line.
    len = input.length, // The total number of lines in the input.
    items; // An object to store all item data, including price and recipes.

  // Loop through the input array, processing each test case.
  for ( i = 0; i < len; ) {
    items = {}; // Initialize an empty object for items for each new test case.

    // Parse the number of items with direct prices and update the 'i' index.
    // The number read is added to the current 'i' to get the end index 'n'.
    n = parseInt(input[i++], 10) + i;

    // If 'n' equals 'i', it means the count of direct-priced items was 0,
    // which signifies the end of input or an empty test case.
    if ( n === i )
      break;

    // Loop to read and store items that have direct prices.
    for ( ; i < n; i++ ) {
      line = input[i].split(' '); // Split the current line by spaces.
      // Store the item with its name as key and an object containing its price.
      items[line[0]] = { price: parseInt(line[1], 10) };
    }

    // Parse the number of items with recipes and update the 'i' index.
    m = parseInt(input[i++], 10) + i;

    // Loop to read and add recipe information to existing items.
    for ( ; i < m; i++ ) {
      line = input[i].split(' '); // Split the current line into parts.
      // Assign the recipe components (all parts from the third element onwards)
      // to the 'recipe' property of the corresponding item.
      items[line[0]].recipe = line.slice(2);
    }

    /*
     * Another debug statement from the original code.
     * console.log(items); // This would output the fully parsed items object for debugging.
     */

    // Calculate and print the minimum cost for the target item,
    // which is the next line in the input array.
    console.log( howMuch(items, input[i++]) );
  }
}


// Global variable to accumulate all incoming standard input data.
var
  input = ''; // Will be a string that stores all data read from stdin.

// Resume the standard input stream, ensuring the program doesn't exit prematurely.
process.stdin.resume();
// Set the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');

// Attach an event listener for 'data' events on the standard input.
// Each time a chunk of data is received, it's appended to the 'input' string.
process.stdin.on('data', function( chunk ) {
  input += chunk;
});

// Attach an event listener for the 'end' event on the standard input.
// This fires when there is no more data to be read from stdin.
process.stdin.on('end', function() {
  // Split the accumulated input string into an array of lines.
  input = input.split('\n');
  // Call the main function to begin processing the parsed input.
  main();
});