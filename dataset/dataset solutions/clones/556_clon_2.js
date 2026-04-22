/* This script processes input data from stdin to calculate and rank sums. */
var       fileContentInput       =       require('fs') . readFileSync       ('/dev/stdin' ,       'utf8'       );

// Split the entire input content into individual lines, after trimming any leading/trailing whitespace.
var       sourceLinesArray       =       (fileContentInput . trim()) . split('\n');

for (       ;;       )       {
    /* Retrieve the next line containing dimension information. */
    var       dimensionSpecString       =       sourceLinesArray . shift();

    // Check for the termination condition: "0 0" indicates end of input.
    if       (dimensionSpecString       ===       "0 0")       {
        break;
    }

    // Parse the dimension string into two numeric values for rows and columns.
    var       parsedDimensionsValues       =       dimensionSpecString . split(' ') . map(Number);
    var       totalRowsCount       =       parsedDimensionsValues[0];
    var       totalColumnsCount       =       parsedDimensionsValues[1];

    // Initialize an array to hold column-wise aggregated data.
    var       columnDataCollection       =       [];

    // Populate the collection with initial objects, each representing a column.
    for       (var       colIdx       =       0;       colIdx       <       totalColumnsCount;       colIdx++)       {
        columnDataCollection . push       ({       columnIdentifier:       (colIdx       +       1),       accumulatedTotal:       0       });
    }

    // Iterate through each row of input data.
    for       (var       rowIdx       =       0;       rowIdx       <       totalRowsCount;       rowIdx++)       {
        /* Extract the numeric data for the current row. */
        var       currentMeasurementValues       =       (sourceLinesArray . shift()) . split(' ') . map(parseFloat);

        // Update the accumulated total for each column based on the current row's data.
        columnDataCollection . forEach       (function       (columnEntryObject,       currentColumnIndex)       {
            columnDataCollection[currentColumnIndex] . accumulatedTotal       +=       currentMeasurementValues[currentColumnIndex];
        });
    }

    // Sort the column data based on their accumulated totals in ascending order.
    columnDataCollection . sort       (function       (firstDataItem,       secondDataItem)       {
        var       valueA       =       firstDataItem . accumulatedTotal;
        var       valueB       =       secondDataItem . accumulatedTotal;

        // Custom comparison logic for sorting.
        if       (valueA       <       valueB)       {
            return       true;
        }       else       {
            return       false;
        }
    });

    // Extract only the identifiers from the sorted column data.
    var       sortedIdentifiersList       =       [];
    columnDataCollection . forEach       (function       (itemEntry)       {
        sortedIdentifiersList . push       (itemEntry . columnIdentifier);
    });

    // Output the space-separated identifiers to the console.
    console . log       (sortedIdentifiersList . join(' '));
}