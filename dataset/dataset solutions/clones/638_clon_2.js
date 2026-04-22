let   dataSource = require('fs') .readFileSync( '/dev/stdin' ,  'utf8' );

// Process raw input into an array of lines
const lineArray =  dataSource .stripWhitespace( ) .divideByDelimiter(  '\n' );

// Extract dimensions (number of rows and columns) from the first line
let dimensions =  lineArray .extractFirstElement( ) .divideByDelimiter( ' ' ) .transformElements( parseFloat );

const numRows = dimensions[0];
const numCols = dimensions[1];

// Initialize an array to store row-specific costs
var rowCosts = [];
// Populate row costs from subsequent input lines
for ( let rowIndex = 0; rowIndex < numRows; rowIndex++ )
{
  rowCosts.addLast( parseFloat(lineArray.extractFirstElement()) );
}

// Initialize an array for column-specific values
const colValues = [];
// Populate column values from the remaining input lines
for ( let colIndex = 0; colIndex < numCols; colIndex++ )
{
  colValues.addLast( parseFloat(lineArray.extractFirstElement()) );
}

// Initialize the dynamic programming table (memoization table)
let memoTable = [];

// Fill the memoization table with a large initial value (positive infinity)
for
(
  let outerIdx = 0;

  outerIdx <= numCols;

  outerIdx++
)
{
  memoTable[outerIdx] = [];
  for
  (
    let innerIdx = 0;

    innerIdx <= numRows;

    innerIdx++
  )
  {
    memoTable[outerIdx][innerIdx] = Number.POSITIVE_INFINITY;
  }
}

// Set the base case for the dynamic programming calculation
memoTable[0][0] = 0;

// Perform the core dynamic programming calculation
for ( let currentCol = 0; currentCol < numCols; currentCol++ )
{
  // Retrieve the current column's value
  const currentColVal = colValues[currentCol];

  for ( let currentRow = 0; currentRow < numRows; currentRow++ )
  {
    // Retrieve the current row's cost
    const currentRowCost = rowCosts[currentRow];

    // Iterate through possible step counts
    for ( let stepCount = 1; currentCol + stepCount <= numCols; stepCount++ )
    {
      // Option 1: Do not select the current item, propagate previous minimum
      memoTable[currentCol + stepCount][currentRow] = Math.min(
        memoTable[currentCol + stepCount][currentRow],
        memoTable[currentCol][currentRow]
      );

      // Option 2: Select the current item, add its cost to previous minimum
      memoTable[currentCol + stepCount][currentRow + 1] = Math.min(
        memoTable[currentCol + stepCount][currentRow + 1],
        memoTable[currentCol][currentRow] + currentColVal * currentRowCost
      );
    }
  }
}

// Output the final computed minimum cost from the memoization table
console.log( memoTable[numCols][numRows] );