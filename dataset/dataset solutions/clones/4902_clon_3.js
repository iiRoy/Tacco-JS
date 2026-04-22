/**
 * Processes a schedule of activities to minimize inconvenience.
 * This simulation aims to select a different category each time if possible,
 * incurring a penalty if the same category must be chosen consecutively.
 *
 * @param {string} rawInputPayload The raw input string, typically from standard input.
 */
function processActivitySchedule(rawInputPayload) {
  // Split the raw input string into individual lines for easier parsing.
  const activityLines = rawInputPayload.trim().split('\n');

  // Extract the primary operational parameters from the first line.
  // 'capacityStr' represents the total number of operations to perform (analogous to K).
  // 'categoryCountStr' is the total number of distinct categories (analogous to T),
  // which is parsed but not directly utilized in the core simulation logic.
  const [capacityStr, categoryCountStr] = activityLines[0].split(' ');
  let capacityLimit = parseInt(capacityStr, 10);
  const categoryCount = parseInt(categoryCountStr, 10); // This variable is parsed but not used in the processing loop.

  // Parse the initial quantities for each category from the second line.
  // Each category is stored as an object to improve readability and maintainability,
  // containing its unique 'categoryId' and its 'currentQuantity'.
  let itemCategories = activityLines[1].split(' ').map((quantityString, categoryIdx) => ({
    categoryId: categoryIdx,
    currentQuantity: parseInt(quantityString, 10),
  }));

  // Initialize tracking variables for the simulation.
  // 'lastSelectedCategoryId' keeps track of the category chosen in the immediately preceding step,
  // initialized to null to signify no previous selection.
  // 'penaltyPoints' accumulates the total inconvenience score.
  let lastSelectedCategoryId = null;
  let penaltyPoints = 0;

  // Begin the main simulation loop. It continues as long as there are operations remaining
  // within the defined 'capacityLimit'.
  while (capacityLimit > 0) {
    // --- Type III: Added an intermediate step and a guard clause for robustness ---
    // Calculate the sum of all remaining items across all categories.
    // This helps in detecting scenarios where capacityLimit > 0 but no items are available,
    // which would otherwise lead to an infinite loop (assuming valid input guarantees items).
    const totalRemainingItems = itemCategories.reduce((sum, item) => sum + item.currentQuantity, 0);
    if (totalRemainingItems === 0) {
      // If no items are left but the capacity limit hasn't been met, it implies an
      // unexpected state or invalid input. Break the loop to prevent infinite execution.
      break;
    }

    // Sort the categories in descending order based on their 'currentQuantity'.
    // This greedy approach prioritizes categories with more available items for selection.
    itemCategories.sort((categoryA, categoryB) => categoryB.currentQuantity - categoryA.currentQuantity);

    let chosenCategoryForThisCycle = null;
    let preferredOptionChosen = false; // Flag to indicate if a non-consecutive category was successfully selected.

    // --- Type III: Changed loop structure from 'for (var i=0; ...)' to 'for (const ... of ...)' ---
    // First attempt: Try to find a category that is available (quantity > 0) AND
    // is different from the one selected in the previous cycle.
    for (const currentCategoryCandidate of itemCategories) {
      if (currentCategoryCandidate.currentQuantity > 0 && currentCategoryCandidate.categoryId !== lastSelectedCategoryId) {
        chosenCategoryForThisCycle = currentCategoryCandidate;
        preferredOptionChosen = true;
        break; // A suitable preferred category was found, exit this search.
      }
    }

    // If no preferred (non-consecutive) category could be chosen, proceed to select any available category.
    // This scenario typically incurs a penalty.
    if (!preferredOptionChosen) {
      // --- Type III: Penalty logic is now explicitly associated with the fallback selection ---
      // Iterate through categories again to find any available item, regardless of its previous selection status.
      for (const currentCategoryCandidate of itemCategories) {
        if (currentCategoryCandidate.currentQuantity > 0) {
          chosenCategoryForThisCycle = currentCategoryCandidate;
          penaltyPoints++; // Increment the penalty score as a non-preferred choice had to be made.
          break; // An available category was found, exit this search.
        }
      }
    }

    // Update the simulation state based on the category chosen for the current cycle.
    if (chosenCategoryForThisCycle) {
      lastSelectedCategoryId = chosenCategoryForThisCycle.categoryId; // Record the ID of the newly selected category.
      chosenCategoryForThisCycle.currentQuantity--; // Decrement the quantity of the selected category.
      capacityLimit--; // Decrement the total remaining operations.
    } else {
      // --- Type III: Added a guard clause for unexpected conditions ---
      // This block should ideally not be reached if the 'totalRemainingItems' check is effective.
      // If it is, it indicates a scenario where 'capacityLimit > 0' but no categories could be chosen,
      // possibly due to an unhandled edge case or invalid input data.
      console.error("Error: Remaining capacity exists, but no categories could be selected.");
      break; // Break the loop to prevent an infinite execution in such unexpected circumstances.
    }
  }

  // After the simulation loop concludes, output the final accumulated penalty points.
  console.log(penaltyPoints);
}

// Execute the activity schedule processing function by reading input from standard input.
processActivitySchedule(require("fs").readFileSync("/dev/stdin", "utf8"));