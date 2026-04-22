function Main ( input )
{
  // This function processes the input to find a specific pattern.
  input = input.split ( "\n" ) ; /* The input string is split by newline characters.
                                     Expected format: [N_value, L_values_string]
                                     e.g., ["5", "12345"] */

  // The following line for N was commented out in the original, so it remains commented.
  /* const N = parseInt ( input [ 0 ] , 10 ) ; // N would typically represent the count of items. */


  // hairetu (array) will hold individual characters from the second line of input.
  const hairetu = input [ 1 ] . split ( "" ) ; /* The second line of input is split into an array of individual characters.
                                                    Example: if input[1] is "abcde", hairetu becomes ["a","b","c","d","e"]. */


  let result = 0 ; /* Initialize a counter variable. This variable will store
                      the final count of combinations that satisfy the conditions. */


  // Begin nested loops to iterate through all unique combinations of three elements.
  // The outer loop picks the first element.
  for ( let i = 0 ; i < hairetu.length ; i ++ )
  {

    // The second loop picks the second element, ensuring it's different from the first.
    for ( let j = i + 1 ; j < hairetu.length ; j ++ )
    {

      // The innermost loop picks the third element, ensuring it's different from the first two.
      for ( let k = j + 1 ; k < hairetu.length ; k ++ )
      {
        // Check multiple conditions for the chosen three elements (hairetu[i], hairetu[j], hairetu[k]).
        // These conditions typically represent the triangle inequality theorem and distinctness of elements.
        if (
             hairetu [ i ] < hairetu [ j ] + hairetu [ k ]
          && hairetu [ j ] < hairetu [ i ] + hairetu [ k ]
          && hairetu [ k ] < hairetu [ i ] + hairetu [ j ]

          // Additionally, ensure all three elements are distinct from each other.
          && hairetu [ i ] !== hairetu [ j ]
          && hairetu [ j ] !== hairetu [ k ]
          && hairetu [ i ] !== hairetu [ k ]
        )
        {
          // If all conditions are met, increment the result counter.
          result ++ ; // This combination forms a valid "triangle" or satisfies the problem's criteria.
        }
      } /* End of innermost loop (k) */

    } /* End of middle loop (j) */

  } /* End of outermost loop (i) */


  // Output the final calculated result to the console.
  console . log ( result ) ; // Display the total count of valid combinations.
}


// Call the Main function with input read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Standard input is read as a UTF-8 string.