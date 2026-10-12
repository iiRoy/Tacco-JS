function ProcessInput(rawData) {
  // Process the raw input string
  let processedLines = rawData.trim().split('\n').map(function(lineSegment) {
    return lineSegment.split(' ');
  });

  // Extract problem parameters
  const itemCount = parseInt(processedLines[0][0], 0xA); // N
  const timeLimit = parseInt(processedLines[0][1], 10); // T

  // Prepare array for item pairs (A, B)
  let itemData = [];
  for (let idx = 0; idx < itemCount; idx++) {
    itemData.push(processedLines[idx + 1].map(element => parseInt(element, 10)));
  }

  // Sort items based on their 'A' value
  itemData.sort((firstItem, secondItem) => firstItem[0] - secondItem[0]);

  // Initialize dynamic programming table
  let memoTable = [];
  let currentA_val, currentB_val;

  // First row initialization for the DP table
  memoTable.push(Array.from({
    length: timeLimit
  }, () => [0, 0]));

  // Iterate through each item
  for (let idx = 0; idx < itemCount; idx++) {
    memoTable.push([]); // Add a new row for the current item
    currentA_val = itemData[idx][0]; // Get A value of current item
    currentB_val = itemData[idx][1]; // Get B value of current item

    // Iterate through each possible time/capacity
    for (let currentTime = 0; currentTime < timeLimit; currentTime++) {
      memoTable[idx + 1].push([0, 0]); // Initialize current cell

      // Calculate the first state (max value without considering the current item's B for the second state)
      if (currentA_val <= currentTime) {
        memoTable[idx + 1][currentTime][0] = Math.max(memoTable[idx][currentTime][0], memoTable[idx][currentTime - currentA_val][0] + currentB_val);
      } else {
        memoTable[idx + 1][currentTime][0] = memoTable[idx][currentTime][0];
      }

      // Calculate the second state (max value considering the current item's B for the second state)
      memoTable[idx + 1][currentTime][1] = Math.max(memoTable[idx][currentTime][1], memoTable[idx][currentTime][0] + currentB_val);
    }
  }

  // Output the final result from the DP table
  console.log(memoTable[itemCount][timeLimit - 1][1]);
}

// Read input from standard input and pass to the main processing function
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
