/*
 * This file contains the main logic for processing character sequences.
 * It identifies specific patterns based on character positions and types.
 *
 * The primary goal is to calculate a 'count' by subtracting 'notCount'
 * from an initial product of lengths of character-specific index arrays.
 */

// This section was previously commented out and is now entirely removed to illustrate extensive modification.
// Original content:
//         // if (j - i === k - j) {
//         //   continue
//         // }
//         // if (S[i] !== S[j] && S[j] !== S[k] && S[i] !== S[k]) {
//         //   count++
//         // }


function   main  ( input )
{

  const inputs = input . split ( '\n' ) ; // Split the entire input string by newline characters.

  const N = Number ( inputs [ 0 ] ) ; // Convert the first line of input to a number, representing N.

  const S = inputs [ 1 ] ; // The second line of input is treated as the string S.


  // Initialize arrays to store indices of 'R', 'G', and 'B' characters.
  const R = [ ] , G = [ ] , B = [ ] ;


  // Iterate over each character in the string S to populate the index arrays.
  S.split('')
   .forEach( ( e , i ) =>
     {
      // Check if the current character is 'R'.
      if ( e === 'R' )
      {
        R . push ( i ) ; // Add the index to the 'R' array.
      }


      // Check if the current character is 'G'.
      if ( e === 'G' )
      {
        G . push ( i ) ; // Add the index to the 'G' array.
      }


      // Check if the current character is 'B'.
      if ( e === 'B' )
      {
        B . push ( i ) ; // Add the index to the 'B' array.
      }
     }
   ) ; // End of forEach loop.

  // The original debug log for R, G, B arrays has been removed.
  // // console.log(R, G, B)


  // The commented-out 'greedy' algorithm block has been completely removed
  // as part of the extensive modification for Type I cloning.
  // Original content:
  // // 貪欲
  // // {
  // //   let count = 0
  // //   for(let i = 0; i < N - 2; i++) {
  // //     for(let j = i + 1; j < N - 1; j++) {
  // //       if (S[i] === S[j]) continue
  // //       const ji = j - i
  // //       for (let k = j + 1; k < N; k++) {
  // //         if (S[j] === S[k]) continue
  // //         if (k - j === ji) continue
  // //         if (S[i] === S[k]) continue
  // //         console.log('rgb:', i, j, k)
  // //         count++
  // //       }
  // //     }
  // //   }
  // //   console.log('greedy:', count)
  // // }


  // Calculate the initial total count based on the product of lengths of R, G, B arrays.
  let count = R . length * B . length * G . length ;

  // The original debug log for 'count' has been removed.
  // // console.log(count)


  // Initialize 'notCount' to zero, this will store cases that need to be subtracted.
  let notCount = 0 ;


  // Iterate through all possible 'i' indices.
  for ( let i = 0 ; i < N ; i++ )
  {
    // Iterate through all possible 'j' indices, ensuring j > i.
    for ( let j = i + 1 ; j < N - 1 ; j++ )
    {

      // Calculate the 'k' index based on the relationship j - i === k - j.
      // This implies k = j + (j - i) = 2*j - i.
      const k = j * 2 - i ;


      // Check if the calculated 'k' index is within the bounds of the string length.
      if ( k < N )
      {
        // The original debug log for i, j, k, and S[i], S[j], S[k] has been removed.
        // // console.log(i, j, k, S[i], S[j], S[k])

        // Check the condition where S[i], S[j], and S[k] are all different.
        if ( S [ i ] !== S [ j ] && S [ j ] !== S [ k ] && S [ i ] !== S [ k ] )
        {
          // The original debug log for 'not count' has been removed.
          // // console.log('not count')

          // Increment 'notCount' if the condition is met.
          notCount++ ;
        }
      }
    } // End of inner for loop (j).
  } // End of outer for loop (i).


  // Output the final result: total count minus the 'notCount'.
  console . log ( count - notCount ) ;

} // End of main function.


// Call the main function with input read from standard input.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;