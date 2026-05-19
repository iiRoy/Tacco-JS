function processInputData(rawData) {
  // Parse the initial configuration parameters from the first line of the input.
  // These represent the number of items, the effective distance threshold, and the attack power.
  const initialParams = rawData[0].split(' ');
  const numItems = Number(initialParams[0]); // Corresponds to N in the original
  const distanceThreshold = Number(initialParams[1]); // Corresponds to D in the original
  const attackPower = Number(initialParams[2]); // Corresponds to A in the original

  // Initialize an array to store the item data.
  // Each item will be an array, typically [position, health].
  let itemRecords = [];

  // Populate the itemRecords array by parsing subsequent lines of the raw input.
  // Each line is split by space, and string values are converted to numbers.
  for (let idx = 1; idx <= numItems; idx++) {
    itemRecords.push(rawData[idx].split(' ').map(strVal => Number(strVal)));
  }

  // Sort the item records based on their position (the first element).
  // This ensures processing items in increasing order of their location.
  itemRecords.sort((recordA, recordB) => recordA[0] - recordB[0]);

  let totalAttacks = 0; // This variable will accumulate the total number of attacks performed.

  // Iterate through each item record to determine the necessary attacks.
  for (let idx = 0; idx < numItems; idx++) {
    let currentItem = itemRecords[idx]; // The item currently being considered, e.g., [position, health]

    // If the current item still has health points remaining, it needs to be attacked.
    if (currentItem[1] > 0) {
      // Calculate the number of bombs (attacks) required to defeat this item.
      // Math.ceil is used because even a fraction of health requires a full bomb.
      const requiredBombs = Math.ceil(currentItem[1] / attackPower);
      totalAttacks += requiredBombs; // Add these bombs to the overall count.

      // Apply the damage from these bombs to all items within the effective range.
      // This loop starts from the current item and goes to the end of the list.
      for (let innerIdx = idx; innerIdx < numItems; innerIdx++) {
        let targetItem = itemRecords[innerIdx]; // Another item that might be affected.

        // Check if the target item is within the attack radius of the current item's attack.
        // The range is calculated as currentItem's position + (2 * distanceThreshold) + 1.
        if (targetItem[0] <= currentItem[0] + (distanceThreshold * 2) + 1) {
          // If within range, reduce the target item's health by the total damage dealt.
          targetItem[1] -= attackPower * requiredBombs;
        } else {
          // If a target item is out of range, all subsequent items will also be out of range
          // because the list is sorted by position. So, we can break early.
          break;
        }
      }
    }
  }

  // Output the final calculated total number of attacks to the console.
  console.log(totalAttacks);
}

// Read the input data from standard input, decode it as UTF-8, and split it into lines.
// Then, pass this array of lines to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').split('\n'));
