// This function processes input data to find the closest number to a target that is not in a given exclusion list.
function  findClosestNumber (   dataLines  ) {
  // Parse the first line of input to get the primary number and the count of excluded numbers.
  const   [ targetValue ,  exclusionCount  ]  =  dataLines[0] . trim () . split (  " "  ) . map (  ( strNum )  =>  parseInt ( strNum ,  10 )  ) ;

  // Check if there are any numbers to exclude.
  if  ( exclusionCount  !==  0  )
  {
    // Parse the second line of input to get the list of numbers that are forbidden.
    const   forbiddenNumbers  =  dataLines[1] . trim () . split (  " "  ) . map (  ( currentStr )  =>  parseInt ( currentStr ,  10 )  ) ;

    // Initialize an offset variable to search outwards from the target value.
    let   deviation  =  0 ;

    // Loop indefinitely until a suitable number is found.
    while  ( true  )
    {
      // Check the number below the target value by the current deviation.
      if  (  ! forbiddenNumbers . includes ( targetValue  -  deviation )  )
      {
        // If this number is not forbidden, print it and exit the loop.
        console . log ( targetValue  -  deviation ) ;
        break ;
      }

      // Check the number above the target value by the current deviation.
      if  (  ! forbiddenNumbers . includes ( targetValue  +  deviation )  )
      {
        // If this number is not forbidden, print it and exit the loop.
        console . log ( targetValue  +  deviation ) ;
        break ;
      }

      // Increment the deviation to check numbers further away in the next iteration.
      deviation++;
    }
  }
  else
  {
    // If there are no exclusions, the target value itself is the answer.
    console . log ( targetValue ) ;
  }
}

// Read input from standard input, parse it, and pass it to the main processing function.
findClosestNumber (  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) . trim () . split ( "\n" )  ) ;