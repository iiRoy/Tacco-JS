// The primary execution entry point for processing input data
function processInputData(sourceText) {
    // Break down the input string into individual lines, filtering out any empty ones.
    const contentLines = sourceText.split('\n').filter(segment => segment.length > 0);

    // Parse the total count of inventory items from the first line.
    const stockQuantity = Number(contentLines[0]);
    // Parse the individual inventory items from the second line, converting them to numbers.
    const stockItems = contentLines[1].split(' ').map(Number);

    // Parse the total count of demanded items from the third line.
    const orderQuantity = Number(contentLines[2]);
    // Parse the individual demanded items from the fourth line, converting them to numbers.
    const orderItems = contentLines[3].split(' ').map(Number);

    // Generate a frequency map for the available inventory items.
    // This map stores each unique item as a key and its count as the value.
    const inventoryRegister = stockItems.reduce((ledger, product) => {
        ledger.set(product, (ledger.get(product) || 0) + 1);
        return ledger;
    }, new Map());

    // Generate a frequency map for the demanded items.
    // This map stores each unique demanded item and its required count.
    const demandRegister = orderItems.reduce((wishlist, desiredProduct) => {
        wishlist.set(desiredProduct, (wishlist.get(desiredProduct) || 0) + 1);
        return wishlist;
    }, new Map());

    // Determine if all demanded items can be satisfied by the inventory.
    let fulfillmentPossible = true;

    // Iterate through each item and its required quantity in the demand register.
    for (const [requiredArticle, quantityNeeded] of demandRegister.entries()) {
        // Get the available quantity of the current item from the inventory register.
        // If the item is not in inventory, its available quantity is considered 0.
        const quantityAvailable = inventoryRegister.get(requiredArticle) || 0;

        // If the quantity needed for any item exceeds the quantity available,
        // then fulfillment is not possible, and we can stop checking.
        if (quantityNeeded > quantityAvailable) {
            fulfillmentPossible = false;
            break;
        }
    }

    // Output the final decision based on whether fulfillment is possible.
    console.log(fulfillmentPossible ? "YES" : "NO");
}

// Function for local debugging purposes (e.g., in a browser environment)
function initiateLocalTest() {
	const testDataField = document.getElementById("input").value;
	processInputData(testDataField);
}

// This section handles reading from standard input and invoking the main logic.
// It should not be modified to ensure compatibility with typical competitive programming environments.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));