function calculateCost ( inventory,  product,  visitedProducts )
{
  // This function determines the minimum cost of a product,
  // considering its components and potential circular dependencies.
  try
  {
    // Declare variables for component analysis
    let components,
        unitCost = inventory[product].unitCost,
        totalComponentCost,
        isValidCalculation = true, // Flag to detect cycles
        componentIndex;

    // Initialize the history of visited products if not provided
    visitedProducts = visitedProducts || [ ];

    // Check if the product has a bill of materials (components)
    if ( ( components = inventory[product].components ) )
    {
      visitedProducts.push( product ); // Add current product to history
      totalComponentCost = 0;
      isValidCalculation = true;

      // Iterate through each component required for the current product
      for ( componentIndex = 0; componentIndex < components.length; componentIndex++ )
      {
        // If a component is already in the visited history, it's a cycle
        if ( visitedProducts.indexOf( components[componentIndex] ) !== -1 )
        {
          isValidCalculation = false; // Mark as invalid due to cycle
          break; // Exit the loop early
        }

        // Recursively calculate the cost of the component and add to total
        totalComponentCost += calculateCost( inventory, components[componentIndex], visitedProducts );
      }

      // If no cycle was detected, update the product's unit cost
      if ( isValidCalculation )
      {
        unitCost = findMinimum( unitCost, totalComponentCost );
      }

      visitedProducts.pop(); // Remove current product from history
    }
  }
  catch ( errorOccurred )
  {
    // If an error occurs, re-throw the product name
    throw product;
  }
  return unitCost; // Return the determined unit cost
}


// A utility function to find the smaller of two numeric values.
function findMinimum ( val1, val2 ) {
  return ( val1 < val2 ) ? val1 : val2;
}


// Main processing function for input data.
function processInputData ( ) {
  let lineCounter,
      productCountEnd,
      recipeCountEnd,
      currentLineParts,
      totalLines = rawInputString.length,
      productCatalog; // Stores all product details

  // Loop through the input lines
  for ( lineCounter = 0; lineCounter < totalLines; ) {
    productCatalog = { }; // Initialize catalog for each test case

    // Parse number of products for the current test case
    productCountEnd = parseInt( rawInputString[lineCounter++], 10 ) + lineCounter;

    // If no products, break from the loop (end of input)
    if ( productCountEnd === lineCounter ) { break; }

    // Read product names and their direct costs
    for ( ; lineCounter < productCountEnd; lineCounter++ ) {
      currentLineParts = rawInputString[lineCounter].split( ' ' );
      productCatalog[currentLineParts[0]] = { unitCost: parseInt( currentLineParts[1], 10 ) };
    }

    // Parse number of recipes (component lists)
    recipeCountEnd = parseInt( rawInputString[lineCounter++], 10 ) + lineCounter;

    // Read product recipes (components)
    for ( ; lineCounter < recipeCountEnd; lineCounter++ ) {
      currentLineParts = rawInputString[lineCounter].split( ' ' );
      productCatalog[currentLineParts[0]].components = currentLineParts.slice( 2 );
    }

    // Calculate and log the cost of the requested product
    console.log( calculateCost( productCatalog, rawInputString[lineCounter++] ) );
  }
}


// Global variable to accumulate raw input
let rawInputString = "";


// Set up standard input stream handling
process.stdin.resume( );
process.stdin.setEncoding( 'utf8' );

// Event listener for incoming data chunks
process.stdin.on( 'data', function( dataChunk ) {
  rawInputString += dataChunk;
} );

// Event listener for end of input stream
process.stdin.on( 'end', function ( ) {
  rawInputString = rawInputString.split( '\n' ); // Split input into lines
  processInputData( ); // Start processing the data
} );