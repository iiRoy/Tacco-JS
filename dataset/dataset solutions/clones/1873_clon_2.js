/*
 * This module processes raw input data to find the minimum cost
 * to acquire a set of books that collectively meet specific skill requirements.
 */
function ProcessData( rawData )
{
  // Split the entire input string into an array of individual lines.
  let parsedLines = rawData.split( "\n" );

  // Extract the number of available books, the total number of distinct skills,
  // and the minimum required level for each skill from the first line of input.
  const numBooks = Number( parsedLines[0].split( ' ' )[0] );
  const numSkills = parseInt( parsedLines[0].split( ' ' )[1], 10 );
  const requiredSkillLevel = Number( parsedLines[0].split( ' ' )[2] );

  // Initialize arrays to store book prices and their corresponding skill contributions.
  let bookPrices = [];
  let skillPointsPerBook = [];
  let currentParsedLine; // Temporary variable to hold parsed line segments

  // Iterate through the remaining lines of input, starting from the second line,
  // to populate the book data structures.
  for ( let lineIndex = 1; lineIndex < parsedLines.length; lineIndex++ )
  {
    currentParsedLine = parsedLines[lineIndex].split( ' ' ).map( itemValue => Number( itemValue ) );
    bookPrices.push( currentParsedLine[0] ); // The first value is the book's price.
    currentParsedLine.shift(); // Remove the price, leaving only skill points.
    skillPointsPerBook.push( currentParsedLine.slice() ); // Add the skill points for this book.
  }

  // An array of booleans to track which books are currently selected for a combination.
  // Initially, no books are selected.
  let bookSelectionState = new Array( numBooks );
  bookSelectionState.fill( false );

  // Variable to store the lowest cost found so far that satisfies all skill requirements.
  // Initialized to a very large number (infinity) to ensure any valid cost will be lower.
  let lowestAchievableCost = Infinity;

  // This outer loop iterates through all possible combinations of books.
  // It effectively simulates a binary counter, where each bit represents a book's selection status.
  combinationSearch:
  do {
    // Generate the next combination of selected books.
    // This loop acts like incrementing a binary number: flip bits from right to left until a '0' is found and flipped to '1'.
    for ( let bookIndex = 0; bookIndex < numBooks; bookIndex++ )
    {
      if ( bookSelectionState[bookIndex] ) {
        bookSelectionState[bookIndex] = false; // If book was selected, deselect it.
      } else {
        bookSelectionState[bookIndex] = true; // If book was not selected, select it and move to the next combination.
        break;
      }
    }

    // Now, evaluate the current combination of selected books to see if it meets skill requirements.
    for ( let skillIndex = 0; skillIndex < numSkills; skillIndex++ )
    {
      let totalSkillLevel = 0; // Accumulator for the current skill's total level.
      for ( let currentBookIndex = 0; currentBookIndex < numBooks; currentBookIndex++ )
      {
        if ( bookSelectionState[currentBookIndex] ) { // If the current book is part of the selection
          totalSkillLevel += skillPointsPerBook[currentBookIndex][skillIndex]; // Add its contribution to this skill.
        }
      }
      // If the total level for any skill is below the required minimum, this combination is invalid.
      // Move to the next book combination without calculating cost.
      if ( totalSkillLevel < requiredSkillLevel ) {
        continue combinationSearch;
      }
    }

    // If execution reaches this point, all skill requirements are met for the current book combination.
    // Calculate the total cost for this valid combination.
    let currentTotalCost = 0;
    for ( let bookIndex = 0; bookIndex < numBooks; bookIndex++ ) {
      if ( bookSelectionState[bookIndex] ) {
        currentTotalCost += bookPrices[bookIndex];
      }
    }

    // Update the lowest achievable cost if the current combination is cheaper.
    if ( lowestAchievableCost > currentTotalCost ) {
      lowestAchievableCost = currentTotalCost;
    }
  } while ( !bookSelectionState.every( itemValue => !itemValue ) ); // Continue until all books have been deselected, indicating all combinations explored.

  // Output the final result. If no combination met the requirements, lowestAchievableCost will still be Infinity,
  // in which case output -1. Otherwise, output the minimum cost found.
  console.log( lowestAchievableCost === Infinity ? -1 : lowestAchievableCost );
}


// The following section handles standard input/output and should not be modified.
// It reads the entire standard input and passes it to the main processing function.
ProcessData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );