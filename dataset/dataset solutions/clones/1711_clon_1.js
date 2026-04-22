// Enable strict mode for better error handling and performance.
'use strict' ;


/*
 * Main function to process the input and solve the problem.
 * @param {string} input - The raw input string from stdin.
 */
function Main(  input  )
{
  // Trim whitespace from the input and split it into an array of lines.
  const   tmp =   input . trim ( ) . split ( '\n' ) ;

  // The first line contains the number of days, D.
  const D   = Number ( tmp [ 0 ] ) ;

  // The second line contains the cost coefficients C for each contest type.
  const C = tmp [ 1 ] . split ( ' ' ) . map ( ( v ) => Number ( v ) ) ;


  // The remaining lines represent the satisfaction matrix S.
  // S[i][j] is the satisfaction gained by holding contest j on day i.
  const S   = tmp
    . slice ( 2,   2 + D ) // Extract relevant lines for satisfaction data.
    . map ( ( v ) =>
        v . split ( ' ' ) // Split each line into individual string numbers.
        . map ( ( v ) => Number ( v ) ) // Convert each string number to an actual number.
    ) ;

  // Initialize an array to keep track of the last day each contest type was held.
  // Array size 26 for 0-indexed contest types (a-z).
  let LastContestDays = Array ( 26 ) . fill ( 0 ) ; // Stores the day index.

  // Initialize an array to store the current satisfaction levels for each contest type.
  let currnetContestLebels = Array ( 26 ) . fill ( 0 ) ; // Satisfaction level for each contest type on a given day.

  // Initialize an array to store the satisfaction drops due to not holding a contest.
  let lebelDrops = Array ( 26 ) . fill ( 0 ) ; // Calculated drop in satisfaction for each contest type.


  // Iterate through each day from 1 to D.
  for ( let i = 1 ;   i <= D ;   i ++ )
  {
    // First, calculate the potential satisfaction drop for each contest type
    // if it were *not* held on the current day 'i'.
    for ( let j = 0 ;   j < C . length ;   j ++ )
    {
      // The drop is C[j] * (current_day - last_held_day) * -1.
      // This makes it a penalty, thus negative value.
      lebelDrops [ j ] =   C [ j ] *   ( i - LastContestDays [ j ] ) * -1 ;
    }


    // Next, calculate the current total satisfaction for each contest type
    // if it were chosen to be held on the current day 'i'.
    for ( let k = 0 ;   k < C . length ;   k ++ )
    {
      // Create a copy of the lebelDrops array for this specific calculation.
      const l = [ ... lebelDrops ] ;

      // For the contest type 'k' being considered for today,
      // its satisfaction drop is replaced by the actual satisfaction gained for holding it.
      l [ k ] = S [ i - 1 ] [ k ] ;

      // Sum up all satisfaction components (gains and drops).
      const lr = l . reduce ( ( acc , cur ) => acc + cur ) ;

      // Assign the calculated total satisfaction for contest type 'k' on this day.
      currnetContestLebels [ k ] = lr ;

      // The original commented line below was likely an alternative or debug line.
      // It has been removed as per Type I clone rules (modify/remove comments).
    }


    // Determine which contest type to open on the current day 'i'.
    let openContestNo = 0 ; // Default to the first contest type.
    let maxLebel = 0 ; // Initialize maximum satisfaction found so far.


    // Iterate through all contest types to find the one with the highest current satisfaction.
    for ( let m = 0 ;   m < C . length ;   m ++ )
    {
      // If the current contest type 'm' has a higher satisfaction level,
      // update the maximum satisfaction and the chosen contest number.
      if ( maxLebel   <   currnetContestLebels [ m ] )
      {
        maxLebel = currnetContestLebels [ m ] ;
        openContestNo = m ;
      }
    }

    // Update the last held day for the chosen contest type.
    LastContestDays [ openContestNo ] = i ;

    // Output the 1-indexed number of the chosen contest type for the current day.
    console . log ( openContestNo + 1 ) ;
  }


  // The function implicitly returns undefined if no explicit return value is specified.
  // An explicit 'return;' can be added for clarity, though it's optional.
  return ;
}

// Read the entire input from standard input and pass it to the Main function.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;