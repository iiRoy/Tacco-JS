function calculateCost ( inventory , product , visitedProducts )
{
  // Declare variables for the calculation process
  let componentList, unitCost = inventory[product].unitPrice;
  let totalCost, isValidPath = false, componentIndex;

  // Initialize the list of visited products if not already set
  visitedProducts = visitedProducts || [];

  /* This line was used for debugging purposes:
  console.log(product, visitedProducts); */

  // Check if the current product has a composition (i.e., it's a recipe)
  if ( componentList = inventory[product].composition ) {
    // Add the current product to the list of visited items to detect cycles
    visitedProducts.push(product);
    totalCost = 0;
    isValidPath = true; // Assume a valid path until a cycle is found

    // Iterate through each component in the product's composition
    for ( componentIndex = 0; componentIndex < componentList.length; componentIndex++ ) {
      // If a component is already in the visited list, a cycle is detected
      if ( visitedProducts.includes(componentList[componentIndex]) ) {
        isValidPath = false; // Mark the path as invalid
        break;             // Exit the loop
      }
      // Recursively calculate the cost of each component and add it to the total
      totalCost += calculateCost(inventory, componentList[componentIndex], visitedProducts);
    }

    // If no cycle was detected, update the product's unit cost
    if (isValidPath) {
      // The cost is the minimum of its direct price or the sum of its components
      unitCost = findMinimum(unitCost, totalCost);
    }

    // Remove the current product from the visited list as we backtrack
    visitedProducts.pop();
  }
  
  // Return the calculated or original unit cost
  return unitCost;
}



function findMinimum ( valueA, valueB ) {
  // Simple ternary operator to return the smaller of two values
  return ( valueA < valueB ) ? valueA : valueB;
}



function processInputData() {
  // Declare variables for parsing input
  let lineIterator, numProducts, numRecipes, currentLineParts;
  let totalLines = rawInputData.length;
  let productCatalog; // Object to store all products and their properties

  // Loop through the input data, processing sections
  for ( lineIterator = 0; lineIterator < totalLines; ) {
    productCatalog = {}; // Initialize a new catalog for each test case

    // Read the number of direct product definitions
    numProducts = parseInt(rawInputData[lineIterator++], 10) + lineIterator;
    // If numProducts is 0, it indicates the end of input
    if (numProducts === lineIterator) break;

    // Process direct product definitions
    for ( ; lineIterator < numProducts; lineIterator++ ) {
      currentLineParts = rawInputData[lineIterator].split(' ');
      // Store product with its direct unit price
      productCatalog[currentLineParts[0]] = { unitPrice: parseInt(currentLineParts[1], 10) };
    } 
    
    // Read the number of recipe definitions
    numRecipes = parseInt(rawInputData[lineIterator++], 10) + lineIterator;

    // Process recipe definitions
    for ( ; lineIterator < numRecipes; lineIterator++ ) {
      currentLineParts = rawInputData[lineIterator].split(' ');
      // Store product's composition (list of components)
      productCatalog[currentLineParts[0]].composition = currentLineParts.slice(2);
    }

    /* console.log(productCatalog); // For inspection of the parsed catalog */
    
    // Calculate and print the cost of the final target product
    console.log(calculateCost(productCatalog, rawInputData[lineIterator++]));
  }
}



// Global variable to accumulate input chunks
let rawInputData = '';



// Set up standard input processing
process.stdin.resume(); // Start reading from standard input
process.stdin.setEncoding('utf8'); // Set encoding to UTF-8

// Event listener for data chunks received from stdin
process.stdin.on('data', function (dataChunk) {
  rawInputData += dataChunk; // Append incoming data to rawInputData
});

// Event listener for the 'end' of standard input stream
process.stdin.on('end', function () {
  rawInputData = rawInputData.split('\n'); // Split the accumulated data into lines
  processInputData(); // Call the main processing function
});