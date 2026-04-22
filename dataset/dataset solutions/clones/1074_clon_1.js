class Card
{
  // This class represents a single playing card with a mark (suit) and a value (rank).
  constructor( mark , value )
  {
    // The mark of the card, ensuring it's always stored as a string.
    this . mark = String( mark ) ;
    // The numerical value of the card, ensuring it's always stored as a number.
    this . value = Number( value ) ;
  }


  // Determines if this card object is identical to another card object.
  // Cards are considered equal if both their values and marks match.
  equals( other )
  {
    return this . value === other . value && this . mark === other . mark ;
  }


  // Compares this card's value to another card's value.
  // Returns 0 if values are equal, -1 if this card's value is less, and 1 if greater.
  compareTo( other )
  {
    if ( this . value === other . value )
    {
      return 0 ; // Values are the same
    }
    else if ( this . value < other . value )
    {
      return -1 ; // This card is smaller
    }
    else
    {
      return 1 ; // This card is larger
    }
  }


  // Provides a string representation of the card, e.g., "H 10" for Hearts 10.
  toString()
  {
    return `${ this . mark } ${ this . value }` ;
  }
} // End of Card class definition


// This is an Immediately Invoked Function Expression (IIFE) that serves as the main entry point.
( function main ()
{
  // Load input from standard input, decode it as UTF-8, remove leading/trailing whitespace,
  // and then split the content into an array of lines.
  const lines = require( 'fs' )
    . readFileSync( '/dev/stdin' , 'utf8' )
    . trim()
    . split( '\n' ) ;

  // The first line of input specifies the number of cards, 'n'.
  const n = Number( lines . shift() ) ;

  // Process the remaining lines to create an array of Card objects.
  // Each line is split by space to get the mark and value, then a new Card is instantiated.
  const arr = lines . map( r => r . split( ' ' ) )
                    . map( c => new Card( c[ 0 ] , c[ 1 ] ) ) ;

  // Create a shallow copy of the original array for sorting with QuickSort.
  const quick_arr = Array . from( arr ) ;

  // Call the QuickSort algorithm to sort the 'quick_arr' in place.
  // The sorting range covers the entire array from index 0 to n-1.
  quickSort( quick_arr , 0 , n - 1 ) ;

  // Check the stability of the QuickSort algorithm.
  // 1. Map original cards to objects that include their initial index.
  // 2. Sort these mapped objects stably (by value, then by original index for ties).
  // 3. Compare this stably sorted array with the result of QuickSort.
  //    If all elements match at their respective positions, the QuickSort was stable.
  console . log ( arr . map( ( e , idx ) => ( { val : e , idx : idx } ) )
                  . sort( ( a , b ) => a . val . compareTo( b . val ) || a . idx - b . idx )
                  . every( ( card , i ) => card . val . equals( quick_arr[ i ] ) )
                      ? 'Stable' // Output if the sort was stable
                      : 'Not stable' // Output if the sort was not stable
  ) ;

  // Print the final sorted array (from QuickSort), with each card on a new line.
  console . log( quick_arr . join( '\n' ) ) ;
} )() ; // End of main IIFE execution


// Implementation of the QuickSort algorithm.
// This function sorts a subarray of 'arr' from index 'p' to 'r' in place.
function quickSort( arr , p , r )
{

  // Inner helper function for the Partition step of QuickSort.
  // It selects a pivot, rearranges the subarray, and returns the pivot's final index.
  const partition = function ( arr , p , r )
  {
     // The pivot element is chosen as the last element of the subarray.
     let x = arr[ r ] ;

     // 'i' keeps track of the boundary for elements smaller than or equal to the pivot.
     let i = p - 1 ;

     // Iterate through the subarray from the beginning 'p' up to (but not including) the pivot 'r'.
     for ( let j = p ; j < r ; j ++ )
     {
       // If the current element arr[j] is less than or equal to the pivot 'x'.
       if ( arr[ j ] . compareTo( x ) <= 0 )
       {
         // Increment 'i' and swap arr[i] with arr[j], placing smaller elements to the left.
         i ++ ;
         [ arr[ i ] , arr[ j ] ] = [ arr[ j ] , arr[ i ] ] ;
       }
     }

     // After the loop, place the pivot element (originally at arr[r]) into its correct sorted position.
     // This is done by swapping it with the element just after the 'smaller than pivot' section.
     [ arr[ i + 1 ] , arr[ r ] ] = [ arr[ r ] , arr[ i + 1 ] ] ;

     // Return the final index of the pivot.
     return i + 1 ;
  } ; // End of partition function definition


  // *** CRITICAL NOTE: The original code redefines 'quickSort' within itself. ***
  // This is an unusual and potentially problematic pattern in JavaScript.
  // For a Type I clone, this exact structural redefinition must be preserved.
  // The outer 'quickSort' is called once, then it redefines the 'quickSort' variable
  // to be the recursive sorting logic, which is then immediately called.
  quickSort = function ( arr , p , r )
  {
    // Base case for recursion: if 'p' is less than 'r', there are at least two elements to sort.
    if ( p < r )
    {
      // Perform the partition step and get the pivot's final index 'q'.
      let q = partition( arr , p , r ) ;

      // Recursively call quickSort on the subarray to the left of the pivot.
      quickSort( arr , p , q - 1 ) ;

      // Recursively call quickSort on the subarray to the right of the pivot.
      quickSort( arr , q + 1 , r ) ;
    }
  } ; // End of the inner, recursive quickSort function redefinition


  // This line makes the *initial* call to the newly defined recursive quickSort function.
  // This call happens after the redefinition, effectively starting the recursive sorting process.
  quickSort( arr , p , r ) ;

} // End of the main quickSort function definition