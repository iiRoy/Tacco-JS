// This function processes the entire input data provided.
function   Main  (  input  )
{
  // The input string is split by newlines,
  // where input[0] is the first line, input[1] is the second, and so on.
  input =  input . split (  "\n"  ) ;

  // Parse the first line to get numerical values.
  // It's expected to contain N and other values, but only N is used from this line.
  const  numList0  =  input [  0  ] . split (  ' '  ) . map (  x  =>  parseInt (  x  ,  10  )  ) ;

  // Extract N, which is the first element from the parsed first line.
  const  N  =  numList0 [  0  ] ;

  // Parse the second line to get the list of 'b' values.
  const  bList  =  input [  1  ] . split (  ' '  ) . map (  x  =>  parseInt (  x  ,  10  )  ) ;


  // Initialize the total sum with the first element of bList.
  var  total  =  bList [  0  ] ;

  // Loop through the bList to calculate the sum of minimums.
  // The loop runs N-2 times, for indices from 0 up to N-3.
  for  (  var  i  =  0  ;  i  <  N  -  2  ;  i  ++  )
  {
    // Add the minimum of the current bList element and the next bList element to the total.
    total  +=  Math . min (  bList [  i  ]  ,  bList [  i  +  1  ]  ) ;
  }

  // Add the last relevant element from bList (bList[N-2]) to the total.
  total  +=  bList [  N  -  2  ] ;


  // Output the final calculated total to the console.
  console . log (  total  ) ;
}


// Read input from standard input and pass it to the Main function.
Main (  require (  "fs"  ) . readFileSync (  "/dev/stdin"  ,  "utf8"  )  ) ;