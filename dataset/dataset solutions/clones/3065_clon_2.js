// This module calculates a specific sum based on input values.
function computeTotal ( rawDataString )
{
  // Split the entire raw input string into individual lines.
  var linesOfText = rawDataString . split ( "\n" ) ;

  /*
   * Convert each line of text into an integer number.
   * This creates an array of numerical items.
   */
  var numericItems = linesOfText . map ( currentLine => parseInt ( currentLine ) ) ;

  var targetItemIndex = 0 ; // Initialize the index of the item with the smallest non-zero remainder.
  var lowestNonZeroMod = numericItems [ 0 ] % 10 ; // Start with the remainder of the first item.

  // Iterate through the first five numerical items to find the target.
  for ( var itemIterator = 0 ; itemIterator < 5 ; itemIterator ++ )
  {
    var currentModValue = numericItems [ itemIterator ] % 10 ; // Calculate the remainder for the current item.

    // If the remainder is zero, skip this item as it doesn't affect the 'lowest non-zero' logic.
    if ( currentModValue === 0 )
    {
      continue ;
    }

    // If the current remainder is smaller than the smallest found so far, update.
    if ( currentModValue < lowestNonZeroMod )
    {
      lowestNonZeroMod = currentModValue ; // Update the minimum remainder.
      targetItemIndex = itemIterator ; // Store the index of this item.
    }
  }

  var finalAccumulation = 0 ; // Initialize the variable to store the final computed sum.

  // Loop through the numerical items again to perform the final summation.
  for ( var elementIndex = 0 ; elementIndex < 5 ; elementIndex ++ )
  {
    // If the current item is the 'target' item (with the smallest non-zero remainder).
    if ( elementIndex === targetItemIndex )
    {
      finalAccumulation += numericItems [ elementIndex ] ; // Add its original value directly.
    }
    // For all other items.
    else
    {
      // Calculate the value by rounding up to the nearest multiple of 10.
      finalAccumulation += Math.ceil ( numericItems [ elementIndex ] / 10 ) * 10 ;
    }
  }

  // Display the grand total to the console.
  console . log ( finalAccumulation ) ;
}


// Read input from standard input and pass it to the main processing function.
computeTotal ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;