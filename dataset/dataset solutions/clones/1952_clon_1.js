function main ( input ) {
  // Declare a constant variable 's' and assign the 'input' parameter to it.
  const s = input ;

  // Initialize an empty array named 'array'. This array will store computed values.
  let array = [ ] ;

  // Start a 'for' loop to iterate from 1 up to (but not including) 100.
  // The loop variable is 'i'.
  for ( let i = 1 ; i < 100 ; i ++ )
  {
    // Inside the loop, calculate the product of 2019 and the current value of 'i'.
    // Then, push this calculated value into the 'array'.
    array . push ( 2019 * i ) ;
  }

  // Initialize an empty string variable named 'matchCounter'.
  // This string will be used to count occurrences later.
  let matchCounter = '' ;

  // Start another 'for' loop. This loop iterates through each element in the 'array'.
  // The loop variable is 'j', and it goes from 0 up to (but not including) array.length.
  for ( let j = 0 ; j < array . length ; j ++ )
  {
    // Retrieve the current number from the 'array' at index 'j'.
    // Assign it to the variable 'regNumber'.
    let regNumber = array [ j ] ;

    // Use the 'match' method on the input string 's'.
    // It searches for occurrences of 'regNumber' using a regular expression.
    // The 'g' flag ensures that all global matches are found.
    let match = s . match ( new RegExp ( `${ regNumber }` , 'g' ) ) ;

    // Check if 'match' is not null/undefined and its length is greater than 0.
    // The '(match || '')' part handles cases where 'match' might be null (no matches found).
    if ( ( match || '' ) . length > 0 )
    {
      // If matches are found, append a hash character ('#') to 'matchCounter'.
      matchCounter += '#' ;
    }
  }

  // Finally, print the length of the 'matchCounter' string to the console.
  // This length represents the total number of distinct 'regNumber' values that were found in 's'.
  console . log ( matchCounter . length ) ;

}

// This line reads the content of '/dev/stdin' as a UTF-8 string and passes it
// as an argument to the 'main' function, initiating the program execution.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;