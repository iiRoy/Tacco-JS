function ProcessInputData(rawData) {
    // Split the entire input string into an array of lines
    rawData = rawData.split("\n");

    // Parse the first line to get the initial item count and modification count
    var firstLineParts = rawData[0].split(" ");
    var countItems = parseInt(firstLineParts[0]);
    var numModifications = parseInt(firstLineParts[1]);

    // This variable appears to be unused in the original logic,
    // but its declaration is maintained for structural equivalence.
    var highestValue = 0;

    // Initialize an array to store item details (quantity, price)
    // The size is N (initial items) + M (modified items)
    var itemDetails = new Array(countItems + numModifications);

    // Populate the array with initial items from the second line of input
    // Each initial item has a quantity of 1 and its own price
    var initialItemPrices = rawData[1].split(" ");
    for (var idx = 0; idx < countItems; idx++) {
        var singleItemValue = parseInt(initialItemPrices[idx]);
        itemDetails[idx] = [1, singleItemValue]; // [quantity, price]
    }

    // Populate the array with modified items from subsequent lines
    // Each modified item has a specified quantity and price
    for (var jdx = 0; jdx < numModifications; jdx++) {
        var modificationLineParts = rawData[jdx + 2].split(" ");
        var quantity = parseInt(modificationLineParts[0]);
        var itemPrice = parseInt(modificationLineParts[1]);
        itemDetails[jdx + countItems] = [quantity, itemPrice]; // [quantity, price]
    }

    // Sort the item details array in descending order based on item price
    // If prices are equal, their relative order doesn't matter for the logic
    itemDetails.sort(function(itemX, itemY) {
        if (itemX[1] < itemY[1]) {
            return 1; // itemX comes after itemY (lower price)
        }
        if (itemX[1] > itemY[1]) {
            return -1; // itemX comes before itemY (higher price)
        }
        return 0; // prices are equal
    });

    // Calculate the total cost by acquiring items greedily from the sorted list
    var totalCost = 0;
    var itemsAcquired = 0;

    for (var kdx = 0; kdx < itemDetails.length; kdx++) {
        // Check if we can acquire the full quantity of the current item
        if (itemsAcquired + itemDetails[kdx][0] <= countItems) {
            totalCost += itemDetails[kdx][1] * itemDetails[kdx][0];
            itemsAcquired += itemDetails[kdx][0];
        }
        // If we can acquire at least one more item, but not the full quantity
        else if (itemsAcquired + 1 <= countItems) {
            totalCost += itemDetails[kdx][1] * (countItems - itemsAcquired);
            itemsAcquired = countItems; // We have acquired all N items
        }
        // If we have already acquired N items, stop
        else {
            break;
        }
    }

    // Output the final calculated total cost
    console.log('%s', totalCost);
    return totalCost;
}

// Function for debugging and testing within a browser environment
function performTestRun(testCaseId) {
    // Retrieve input data from a specific HTML element
    var testInputData = document.getElementById("input" + testCaseId).value;

    // Process the input data to get the calculated result
    var calculatedResult = ProcessInputData(testInputData);

    // Initialize the outcome status as "Wrong Answer"
    var outcomeStatus = "WA";

    // Compare the calculated result with the expected output from another HTML element
    if (calculatedResult == document.getElementById("output" + testCaseId).value.split("\n")[0]) {
        outcomeStatus = "AC"; // Set to "Accepted" if they match
    }

    // Display the outcome status in the corresponding result element
    document.getElementById("result" + testCaseId).innerHTML = outcomeStatus;
}

// Main execution block: Read input from standard input and process it
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));