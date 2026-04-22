// Define a local (client-side only) collection to manage our stock items.
// This collection will not persist data to a server database.
const inventoryRecords = new Meteor.Collection("stock_items", { connection: null });

/**
 * Template helper for the 'itemListingView' template.
 * Retrieves all available inventory items from the local collection.
 * Items are sorted by their creation timestamp in descending order,
 * ensuring the newest items appear first.
 * @returns {Mongo.Cursor} A reactive cursor to the inventory records.
 */
Template.itemListingView.getAllInventoryItems = function () {
  // Execute a find operation on the collection, sorting by the 'createdAt' field.
  return inventoryRecords.find({}, { sort: { createdAt: -1 } });
};

// A global counter to track the number of times the UI component has been refreshed.
let viewRefreshCounter = 0;

/**
 * Logs a message to the console indicating that a UI refresh has occurred.
 * This function also increments the global refresh counter.
 * It's primarily used for debugging and monitoring client-side activity.
 */
const displayActivityLog = function () {
  // Ensure this logging only happens in the client environment.
  if (Meteor.isClient) {
    viewRefreshCounter++; // Increment the counter before logging.
    console.info(`[UI Update] Display component has been rendered or re-rendered. Total updates: ${viewRefreshCounter}.`);
  }
};

/**
 * Meteor's 'onRendered' lifecycle hook for the 'itemListingView' template.
 * This callback is executed once the template has been rendered into the DOM.
 */
Template.itemListingView.onRendered(function () {
  // Invoke our custom logging utility to record this rendering event.
  displayActivityLog();
});

// --- Data Generation & Insertion Logic ---

// An array of potential product labels from which new items will be randomly chosen.
const availableProductLabels = ["Apple", "Banana", "Cherry", "Date", "Elderberry"];

/**
 * A utility function to randomly select a single element from a given array.
 * Includes basic validation to handle empty or invalid input arrays gracefully.
 * @param {Array} sourceArray - The array from which to pick an element.
 * @returns {*} A randomly selected element from the array, or null if the array is invalid/empty.
 */
const pickRandomArrayElement = (sourceArray) => {
  if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
    console.warn("Attempted to select a random element from an invalid or empty array.");
    return null;
  }
  const selectedIndex = Math.floor(Math.random() * sourceArray.length);
  return sourceArray[selectedIndex];
};

// Immediately-invoked function expression (IIFE) to encapsulate and start the data generation process.
(function initializeDataStream() {
  // Set up a recurring timer to periodically inject new items into our local collection.
  const dataInjectionTimer = setInterval(() => {
    // Only proceed with data insertion if we are within the client-side context.
    if (Meteor.isClient) {
      const selectedProduct = pickRandomArrayElement(availableProductLabels);

      // A guard clause to ensure a valid product label was chosen before insertion.
      if (selectedProduct) {
        // Construct the new item object with additional metadata.
        const newInventoryItem = {
          productLabel: selectedProduct,
          createdAt: new Date(), // Timestamp for when the item was added.
          inventoryStatus: "in_stock", // An additional field to describe its status.
          quantity: Math.floor(Math.random() * 10) + 1 // Add a random quantity
        };
        inventoryRecords.insert(newInventoryItem);
        // console.log(`New item '${selectedProduct}' added to inventory.`); // Optional: log each insertion.
      } else {
        console.error("No product label was chosen for insertion. Skipping record creation.");
      }
    }
  }, 1750); // The interval for new item creation is set to 1750 milliseconds (1.75 seconds).

  // In a more complex application, 'dataInjectionTimer' might be stored to allow
  // clearing the interval (e.g., using clearInterval(dataInjectionTimer)) when no longer needed.
})(); // End of the IIFE.