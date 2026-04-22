function    SumAbs    (    i    ,    tmp    )
{
  // This function calculates the sum of absolute values for up to three elements
  // starting from the given index 'i' in the array 'tmp'.
  var    sum    =    0    ; // Initialize the sum to zero.

  // Add the absolute value of the element at the starting index 'i'.
  sum    =    Math . abs    (    tmp [ i ]    )    ;

  // Check if the next element (i+1) exists within the array bounds.
  if    (    i    +    1    <    tmp . length    )
  {
    // If it exists, add its absolute value to the running sum.
    sum    +=    Math . abs    (    tmp [ i    +    1 ]    )    ;
  }

  // Check if the element at index (i+2) exists within the array bounds.
  if    (    i    +    2    <    tmp . length    )
  {
    // If it exists, add its absolute value to the sum.
    sum    +=    Math . abs    (    tmp [ i    +    2 ]    )    ;
  }

  // Return the final calculated sum.
  return    sum    ;
}


/**
 * The primary function that processes the input, performs calculations,
 * and prints the final result.
 * It reads problem-specific parameters N and K, and a string S,
 * then applies a series of transformations and calculations.
 * @param {string} input - The raw string input, typically from standard input.
 */
function    Main    (    input    )
{
  // Split the entire input string into an array of lines.
  input    =    input . split    (    "\n"    )    ;


  // Parse the first line of input to extract N and K.
  inputStr    =    input [ 0 ] . split    (    " "    )    ;
  const    N    =    Number . parseInt    (    inputStr [ 0 ]    )    ; // The first integer N.
  const    K    =    Number . parseInt    (    inputStr [ 1 ]    )    ; // The second integer K.


  // Parse the second line of input to extract the string S.
  inputStr    =    input [ 1 ] . split    (    " "    )    ;
  const    S    =    inputStr [ 0 ]    ; // The string S.

  // This section processes the input string S to create an array 'tmp'.
  // It groups consecutive identical characters and stores their counts.
  // Original comments suggest a weighting for 'L' (positive) and 'R' (negative),
  // but this logic is commented out in the provided code.
  var    tmp    =    [ ]    ; // Array to store lengths of consecutive character segments.
  var    lst    =    S . substr    (    0    ,    1    )    ; // Stores the first character of S.
  var    cnt    =    1    ; // Counter for the current segment's length.

  // Iterate through the string S starting from the second character.
  for    (    var    i    =    1    ;    i    <    N    ;    i    ++    )
  {
    // Check if the current character is different from the previous one.
    if    (    S . substr    (    i    ,    1    )    !=    S . substr    (    i    -    1    ,    1    )    )
    {
      // The following commented lines suggest a conditional negation of 'cnt'
      // if the previous segment ended with 'R'. This logic is not active.
      // if( S.substr(i-1,1) === 'R'){
      //   cnt *= -1;
      // }

      // If a character change is detected, push the accumulated count
      // of the previous segment into the 'tmp' array.
      tmp . push    (    cnt    )    ;
      cnt    =    0    ; // Reset the counter for the new segment.
    }
    cnt    +=    1    ; // Increment the counter for the current character.
  }

  // After the loop, handle the count of the very last segment in the string.
  // This ensures the final segment's length is also added to 'tmp'.
  if    (    cnt    !=    0    )
  {
      // Similar commented-out logic for a potential negation based on the last character.
      // if( S.substr(N-1,1) === 'R'){
      //   cnt *= -1;
      // }
      tmp . push    (    cnt    )    ; // Push the count of the last segment.
  }

  // Original debug output line, now commented out.
  // console.log("初期状態",tmp);


  // Core processing logic begins here.
  var    ans    =    0    ; // Initialize the variable to store the final answer.
  var    cnt    =    0    ; // A helper counter, possibly reused or a leftover from development.

  // Handle a special base case where the 'tmp' array has 2 or fewer elements.
  if    (    tmp . length    <=    2    )
  {
    ans    =    N    -    1    ; // In this case, the answer is N-1.
  }
  else
  {
    // This block executes for 'tmp' arrays with more than 2 elements.
    // The comment "累積和処理" (cumulative sum processing) might be misleading,
    // as the actual logic involves iteratively finding a maximum sum and modifying the array.
    for    (    var    j    =    0    ;    j    <    K    ;    j    ++    )
    {
      // Initialize 'last' with a sum of absolute values starting from index 0.
      // Note: The SumAbs function is called with index 0 here.
      var    last    =    SumAbs    (    0    ,    tmp    )    ;
      var    posi    =    0    ; // Variable to store the index where the maximum sum is found.

      // Iterate through the 'tmp' array to find the maximum SumAbs value.
      for    (    var    i    =    1    ;    i    <    tmp . length    ;    i    ++    )
      {
        // Calculate the 'now' sum using SumAbs.
        // Critically, SumAbs is called with '1' as the starting index, not 'i'.
        // This is a direct replication of the original code's behavior.
        var    now    =    SumAbs    (    1    ,    tmp    )    ;

        // If the current 'now' sum is greater than the previously found 'last' maximum.
        if    (    last    <    now    )
        {
          last    =    now    ; // Update 'last' to the new maximum sum.
          posi    =    i    ; // Store the current index 'i' as the position of this maximum.
        }
      }

      // Array modification: Replace 3 elements starting from 'posi' with the 'last' (maximum sum) value.
      // This operation effectively reduces the array size by 2.
      tmp . splice    (    posi    ,    3    ,    last    )    ;
    }

    // Output calculation section.
    // Original debug output line, now commented out.
    // console.log("計算前",tmp);
    // A commented-out loop, indicating a different approach was considered or removed.
    // for(var i=0 ; i<tmp.length ; i++){

    // Sum all elements in the final 'tmp' array using the reduce method.
    ans    =    tmp . reduce    (    function    (    a    ,    b    )
                                 {
                                     return    a    +    b    ; // Accumulate the sum.
                                 }    )    ;
    // Subtract the final length of the 'tmp' array from the accumulated sum.
    ans    -=    tmp . length    ;
    // } // End of the commented-out loop.
  }

  // Print the final calculated answer to the console.
  console . log    (    ans    )    ;
}


// This line is standard for competitive programming in Node.js,
// reading all input from standard input and passing it to the Main function.
Main    (    require    (    "fs"    ) . readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ;