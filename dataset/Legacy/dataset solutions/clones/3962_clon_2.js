function processInput(rawData) {
  // Split the entire input string into an array of lines
  const lines = rawData.split('\n');

  // Parse the number of blue items from the first line
  const numBlueItems = parseInt(lines[0], 10);

  // Parse the number of red items from the line after the blue items
  const numRedItems = parseInt(lines[numBlueItems + 1], 10);

  // Initialize an object to store counts for each item
  let itemCounts = {};

  // Arrays to hold the names of blue and red items
  let blueItems = [];
  let redItems = [];

  // Variable to store the maximum calculated score
  let maxScore;
  
  // Populate the blueItems array
  for (let idx = 1; idx <= numBlueItems; idx++) {
    blueItems.push(lines[idx]);
  }
  
  // Populate the redItems array
  // The red items start after N blue items and the M declaration line
  for (let idx = (numBlueItems + 2); idx <= (numBlueItems + numRedItems + 1); idx++) {
  	redItems.push(lines[idx]);
  }
  
  // Process blue items: increment their count in itemCounts
  for (let counter = 0; counter < blueItems.length; counter++) {
    let itemName = blueItems[counter];
    // If item exists, increment; otherwise, set to 1
    itemCounts[itemName] = itemCounts[itemName] ? itemCounts[itemName] + 1 : 1;
  }
  
  // Process red items: decrement their count in itemCounts
  for (let counter = 0; counter < redItems.length; counter++) {
  	let itemName = redItems[counter];
    // If item exists, decrement; otherwise, set to -1
    itemCounts[itemName] = itemCounts[itemName] ? itemCounts[itemName] - 1 : -1;
  }
  
  // Find the maximum score among all items
  for (let currentKey in itemCounts) {
    // If maxScore is not yet set, or current item's count is greater
    if (maxScore === undefined || itemCounts[currentKey] > maxScore) { 
      maxScore = itemCounts[currentKey];
    }
  }
  
  // Output the result
  // If the maximum score is negative, output 0 as per problem rules
  if (maxScore < 0) {
    console.log(0);
  } else {
    // Otherwise, output the calculated maximum score
    console.log(maxScore);
  }
}

// Read input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
