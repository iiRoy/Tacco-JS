// This function processes the incoming data.
function ProcessInput(rawData) {
  // The first line of rawData contains the necessary values.
  const parts = rawData.split(" "); // Split the input string once
  const totalItems = parseInt(parts[0]); // Parse the first part for total items
  const groupSizeA = parseInt(parts[1]); // Parse the second part for group A size
  const groupSizeB = parseInt(parts[2]); // Parse the third part for group B size

  // Handle a specific edge case where both group sizes sum to zero.
  if (groupSizeA + groupSizeB === 0) {
    console.log(0); // Output zero in this scenario.
    return; // Exit the function early.
  }

  // Calculate the number of full cycles of (A + B) that fit into N.
  const fullCycles = Math.floor(totalItems / (groupSizeA + groupSizeB));
  // Determine the number of items remaining after full cycles.
  const remainingItems = totalItems - (fullCycles * (groupSizeA + groupSizeB));

  let finalCount; // Declare a variable to store the computed result.

  // Check if the remaining items are sufficient to cover another full 'A' group.
  if (remainingItems >= groupSizeA) {
    finalCount = fullCycles * groupSizeA + groupSizeA; // Add a full 'A' group.
  } else {
    finalCount = fullCycles * groupSizeA + remainingItems; // Add only the remaining items.
  }

  // Display the final calculated count.
  console.log(finalCount);
}

// Do not modify the following line; it handles reading from standard input and invoking the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
