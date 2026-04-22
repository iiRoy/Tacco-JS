var dataSource = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' );

// Process the raw input: trim, replace W/B/R with 0/1/2, then split into lines.
// This prepares the data for cost calculation.
var lineData = dataSource.trim().replace(/W/g, "0").replace(/B/g, "1").replace(/R/g, "2").split("\n");

/*
 * Extract the dimensions (number of rows and columns)
 * from the first line of the input data.
 */
var dimensions = lineData.shift().split(" ").map(Number);

// Assign the number of rows.
var rows = dimensions[0];

// Assign the number of columns.
var columns = dimensions[1];

// Pre-calculate costs for changing each row's color to White, Blue, or Red.
// 'colorCountsPerRow' will store an array [cost_W, cost_B, cost_R] for each row.
var colorCountsPerRow = lineData.map(
  function( rowString ) {

    // Initialize costs for the current row to all columns.
    // E.g., if a row has 'm' columns, and we want it to be all white,
    // initially assume all 'm' cells need to change.
    var rowColorCosts = [ columns, columns, columns ];

    // Iterate through each character (column) of the row string.
    for ( let colIdx = 0; colIdx < columns; colIdx++ ) {

      // Decrement the cost for the actual color present in the cell.
      // If the cell is '0' (White), decrement rowColorCosts[0].
      // This means we don't need to change this cell if the whole row
      // is designated as White.
      rowColorCosts[ rowString[colIdx] ]--;

    } // End of column iteration

    return rowColorCosts;
  }
); // End of map function for processing rows

// Initialize the minimum cost found so far to a large value.
var minimumCost = 2500;

// Outer loop: Iterate through possible positions for the first horizontal divider.
// The first divider separates the White segment from the Blue segment.
// It must be at least row 1, and leave at least 2 rows for Blue and Red segments.
for ( let firstDivider = 1; firstDivider < rows - 2; firstDivider++ )
{

  // Inner loop: Iterate through possible positions for the second horizontal divider.
  // The second divider separates the Blue segment from the Red segment.
  // It must be after the first divider (firstDivider + 1) and leave at least 1 row for the Red segment.
  for ( let secondDivider = firstDivider + 1; secondDivider < rows - 1; secondDivider++ )
  {

    // Initialize the total cost for the current partitioning scheme.
    var currentTotalCost = 0;

    // Helper variables for iterating through segments.
    var whiteSegmentRow = firstDivider;
    var redSegmentRow = secondDivider;

    /*
     * Calculate cost for the "White" segment (rows from 0 to firstDivider-1).
     * These rows should all be white.
     */
    while ( whiteSegmentRow >= 0 )
    {
      currentTotalCost += colorCountsPerRow[ whiteSegmentRow ][0]; // Add cost to make this row white.
      whiteSegmentRow--;
    }

    // Calculate cost for the "Blue" segment (rows from firstDivider to secondDivider-1).
    // These rows should all be blue.
    for ( let blueSegmentRow = firstDivider; blueSegmentRow < secondDivider; blueSegmentRow++ )
    {
      currentTotalCost += colorCountsPerRow[ blueSegmentRow ][1]; // Add cost to make this row blue.
    }

    // Calculate cost for the "Red" segment (rows from secondDivider to rows-1).
    // These rows should all be red.
    while ( redSegmentRow !== rows - 1 )
    {
      currentTotalCost += colorCountsPerRow[ redSegmentRow ][2]; // Add cost to make this row red.
      redSegmentRow++;
    }

    // Update the overall minimum cost if the current partitioning yields a lower cost.
    minimumCost = Math.min( minimumCost, currentTotalCost );

  } // End of inner loop (second divider)

} // End of outer loop (first divider)

// Output the final calculated minimum cost to the console.
console.log( minimumCost );