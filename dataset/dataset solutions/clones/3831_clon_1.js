function      uniq    (   array   ) {
  // This function takes an array and returns a new array
  // containing only the unique elements from the input array.

  // Initialize an empty array to store the unique elements found so far.
  const    uniquedArray    =    [ ]   ;


  // Loop through each element in the provided array.
  for    (    var   elem   of   array   )
  {
    // Check if the current element is not already present in the uniquedArray.
    // The indexOf method returns -1 if the element is not found.
    if    (    uniquedArray.indexOf    (    elem    )    <    0    )
    {
      // If the element is unique, add it to the uniquedArray.
      uniquedArray.push   (   elem   )    ;
    }
  }

  // Return the array containing only unique elements.
  return    uniquedArray    ;
}


function    main    (    input    )
{
  // The main function processes the input string.

  // Split the input string by newline characters to get an array of lines.
  const    lines    =    input.split    (    '\n'    )    ;

  // The first line contains the string S.
  const    S    =    lines    [    0    ]    ;

  // The second line contains the integer K.
  const    K    =    parseInt    (    lines    [    1    ]    )    ;


  // This array will store all possible substrings (parts) of S.
  var    part_strings    =    [ ]    ;

  // Outer loop: iterates through all possible starting positions of a substring.
  for    (    var    i    =    0    ;    i    <    S.length    ;    i    ++    )
  {
    // Inner loop: iterates through all possible lengths of a substring,
    // starting from the current 'i'.
    for    (    var    j    =    0    ;    j    <    S.length    -    i    ;    j    ++    )
    {
      // Extract a substring using slice.
      // S.slice(start, end) extracts up to (but not including) the 'end' index.
      // So, for a length of j+1, the end index will be i+j+1.
      part_strings.push    (    S.slice    (    i    ,    i    +    j    +    1    )    )    ;
    }
  }

  /*
  // Debugging: Print all generated part_strings before uniqueness check.
  console.log(part_strings);
  // Debugging: Print the count of generated part_strings.
  console.log(part_strings.length);
  */


  // Filter out duplicate substrings to keep only unique ones.
  part_strings    =    uniq    (    part_strings    )    ;

  /*
  // Debugging: Print unique part_strings after processing.
  console.log(part_strings);
  // Debugging: Print the count of unique part_strings.
  console.log(part_strings.length);
  */


  // This array will store the K lexicographically smallest unique substrings.
  var    result_array    =    [ ]    ;


  // Loop K times to find the K-th smallest unique substring.
  for    (    var    i    =    0    ;    i    <    K    ;    i    ++    )
  {
    // Initialize the current minimum string for this iteration.
    // It's set to an empty string initially.
    var    current_min_str    =    ''    ;


    // Loop through all unique part_strings to find the next smallest one.
    for    (    var    j    =    0    ;    j    <    part_strings.length    ;    j    ++    )
    {
      // Get the current string from the list of unique substrings.
      var    current_str    =    part_strings    [    j    ]    ;

      // First condition: If current_min_str is empty AND
      // current_str has not been added to result_array yet.
      if    (    current_min_str    ==    ''    &&    (    result_array.indexOf    (    current_str    )    <    0    )    )
      {
        // Set current_str as the initial minimum for this iteration.
        current_min_str    =    current_str    ;
      }

      // Second condition: If current_str is lexicographically smaller than current_min_str AND
      // current_str has not been added to result_array yet.
      if    (    (    current_str    <    current_min_str    )    &&    (    result_array.indexOf    (    current_str    )    <    0    )    )
      {
        // Update current_min_str to this new smaller string.
        current_min_str    =    current_str    ;
      }
    }
    // After iterating through all part_strings, the current_min_str holds
    // the smallest string not yet in result_array. Add it.
    result_array.push    (    current_min_str    )    ;
  }

  /*
  // Debugging: Print the entire result_array.
  console.log(result_array);
  */

  // Output the K-th smallest unique substring.
  // This is the last element added to result_array.
  console.log    (    result_array    [    result_array.length    -    1    ]    )    ;
}


// Read input from standard input, decode it as UTF-8, and pass it to the main function.
main    (    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )    )    ;