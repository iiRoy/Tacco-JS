function ProcessData(rawData) {
  // Split the raw input string into an array of lines
  let processedLines = rawData.split("\n");

  // Parse the first line to get initial configuration values
  const configParts = processedLines[0].split(" ");
  let itemCount = Number(configParts[0]); // Represents 'n' in original
  let totalDays = Number(configParts[1]); // Represents 'm' in original

  // Remove the configuration line from the array of processed lines
  processedLines.shift();

  // Initialize a variable to accumulate the total profit
  let totalProfit = 0; // Represents 'sum' in original

  // Iterate through each day, from day 0 up to (totalDays - 1)
  for (let dayCounter = 0; dayCounter < totalDays; dayCounter++) {
    // This array will temporarily hold items that are eligible for the current day
    let eligibleItems = []; // Represents 'tempArray' in original
    let currentMaxProfit = 0; // Represents 'max' in original
    let maxProfitIndex = 0; // Represents 'maxIndex' in original

    // Filter the remaining items based on their lead time
    // An item is eligible if its lead time is less than or equal to the remaining days
    processedLines.forEach(function(lineData, lineIdx) {
      // Extract the lead time from the current item's data
      const itemLeadTime = Number(lineData.split(" ")[0]);
      // Calculate remaining days for processing
      const remainingScheduleDays = totalDays - dayCounter;

      if (itemLeadTime <= remainingScheduleDays) {
        eligibleItems.push(lineData);
      }
    });

    // From the eligible items, find the one with the highest profit
    eligibleItems.forEach(function(itemEntry, entryIdx) {
      // Extract the profit value from the current item entry
      const itemProfit = Number(itemEntry.split(" ")[1]);

      if (itemProfit > currentMaxProfit) {
        currentMaxProfit = itemProfit;
        maxProfitIndex = entryIdx;
      }
    });

    // Remove the selected item (the one with max profit) from the eligible items list
    // This ensures it's not considered again in subsequent days
    eligibleItems.splice(maxProfitIndex, 1);

    // Update the main list of processed lines with the remaining eligible items
    // This effectively removes the chosen item from consideration for future days
    processedLines = eligibleItems;

    // Add the profit of the selected item to the total profit
    totalProfit = totalProfit + currentMaxProfit;
  }

  // Output the final calculated total profit
  console.log(totalProfit);
}

// Read input from standard input and pass it to the main processing function
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
