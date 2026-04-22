// This function initiates the main processing sequence for item acquisition.
function processInput(  rawData )
{
    // The initial input string is separated into an array of individual lines.
    const inputLines = rawData.split(  '\n'  );

    // The first line of input provides critical configuration values.
    let firstLineTokens = inputLines[0].split(  ' '  );

    // The first configuration value represents the total number of distinct items available.
    let availableItemsCount = parseInt(  firstLineTokens[0], 10  );
    // The second configuration value sets the maximum quantity of items that can be obtained.
    let maxItemsToAcquire = parseInt(  firstLineTokens[1], 10  );

    // Variables to track the current state of item acquisition.
    let acquiredItemCount = 0;
    let totalAcquisitionCost = 0;

    // A placeholder object to define the structure for item details.
    let itemRecordSchema = {
        ItemPrice: '',
        StockQuantity: ''
    };

    // An array to store the detailed information of each item.
    let itemCatalog = [];

    // Iterate through the input lines, starting from the second line, to populate the item catalog.
    for ( let itemIndex = 0; itemIndex < availableItemsCount; itemIndex++ ) {
        // Each subsequent line contains details (price and stock) for one item.
        let currentItemTokens = inputLines[  itemIndex + 1  ].split(  ' '  );
        // Store the parsed item price and stock quantity in the catalog.
        itemCatalog[  itemIndex  ] = {
            ItemPrice: parseInt(  currentItemTokens[0], 10  ),
            StockQuantity: parseInt(  currentItemTokens[1], 10  )
        };
    }

    // Sort the entire item catalog based on the item's price in ascending order.
    itemCatalog.sort(  ( itemA, itemB ) => {
        return (  itemA.ItemPrice < itemB.ItemPrice  ) ? -1 : 1;
    }  );

    // A variable to hold the details of the item currently under consideration for purchase.
    let currentCatalogEntry;

    // Begin the primary loop to iterate through the sorted item catalog and make purchasing decisions.
    for ( let itemIndex = 0; itemIndex < availableItemsCount; itemIndex++ ) {
        currentCatalogEntry = itemCatalog[  itemIndex  ];

        // Check if purchasing the entire stock of the current item would exceed the overall acquisition limit.
        if (  currentCatalogEntry.StockQuantity + acquiredItemCount <= maxItemsToAcquire  ) {
            // If not, add the full cost of this item's stock to the total.
            totalAcquisitionCost += currentCatalogEntry.StockQuantity * currentCatalogEntry.ItemPrice;
            // Increment the count of acquired items by the full stock quantity.
            acquiredItemCount += currentCatalogEntry.StockQuantity;

            // If the maximum allowed items have been acquired, terminate the purchasing process.
            if (  acquiredItemCount === maxItemsToAcquire  ) {
                break;
            }
        } else {
            // If purchasing the full stock would exceed the limit, calculate how many more items can be bought.
            let remainingPurchaseQuantity = maxItemsToAcquire - acquiredItemCount;
            totalAcquisitionCost += currentCatalogEntry.ItemPrice * remainingPurchaseQuantity;
            // Since the maximum limit has now been reached with this partial purchase, stop further acquisitions.
            break;
        }
    }

    // Display the final calculated total monetary cost of all acquired items.
    console.log(  totalAcquisitionCost  );
}

// Invoke the main processing function, providing it with data read from the standard input stream.
processInput(  require('fs').readFileSync(  '/dev/stdin',  'utf8'  )  );