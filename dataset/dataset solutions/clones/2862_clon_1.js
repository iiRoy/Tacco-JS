/*
 * This is a JavaScript program designed to process numerical input
 * and compute a specific result based on a series of calculations.
 * The primary function, 'main', orchestrates the entire logic.
 */
function main (  input  ) {

  // Remove any leading or trailing whitespace from the input string.
  input = input.trim(  ) ;

  // Parse the first two space-separated numbers from the input string.
  // N represents the total number of steps/positions.
  const   N   =   parseInt(  input.split(  " "  )[0], 10  ) ;
  // M represents the count of specific points or indices.
  const   M   =   parseInt(  input.split(  " "  )[1], 10  ) ;

  // Initialize an array 'arrA' to store M integer values.
  // These values are extracted from subsequent lines of the input, starting from the second line.
  var   arrA  =  [ ]
  for ( var   i  =  0 ;   i  <  M ;   i ++ ) {
    arrA.push(  parseInt(  input.split(  "\n"  )[i + 1], 10  )  ) ;
  }

  // A counter variable 'mu' used to detect certain conditions
  // (specifically, if there are no gaps of 2 or more between consecutive elements in arrA).
  var mu = 0 ;

  // The 'dansa' array will store calculated differences or gaps between elements.
  var dansa = [ ] ;

  // Calculate the first 'dansa' value, which is the gap before the first element.
  dansa.push(  arrA[0] - 1  ) ;

  // Loop through the 'arrA' array to compute differences between adjacent elements.
  // Each difference represents a "gap" in the sequence.
  for ( var   i  =  1 ;   i  <  M ;   i ++ ) {
    dansa.push(  arrA[i] - arrA[i - 1] - 2  ) ;
  }

  // Calculate the final 'dansa' value, representing the gap after the last element up to N.
  dansa.push(  N - arrA[M - 1] - 1  ) ;

  // The following line was originally commented out and remains so.
  // console.log(dansa);

  /*
   * This loop checks for consecutive "1" differences between elements in 'arrA'.
   * If arrA[i+1] is exactly one greater than arrA[i], it means there's no gap,
   * and the 'mu' counter is incremented.
   */
  for ( var   i  =  0 ;   i  <  arrA.length ;   i ++ ) {
    if (  arrA[i + 1] - arrA[i]  ==  1  ) {
      mu ++ ;
    }
  }

  // 'nantori' will store the results of a Fibonacci-like calculation for each 'dansa' element.
  var nantori = [ ] ;

  // Iterate over each element in the 'dansa' array.
  for ( var   i  =  0 ;   i  <  dansa.length ;   i ++ ) {
    var   ans  =  0 ; // Initialize local answer for the current 'dansa' value.

    // Handle special cases for 'dansa[i]': 0 or 1.
    if (  dansa[i]  ==  1  ||  dansa[i]  ==  0  ) {
      ans  =  1 ;
    }
    // Handle the special case for 'dansa[i]' being 2.
    else if (  dansa[i]  ==  2  ) {
      ans  =  2 ;
    }
    // For other 'dansa[i]' values, calculate using a Fibonacci sequence.
    else {
      var   tempArr  =  [1, 2] ; // Initialize Fibonacci sequence with first two terms.
      for ( var   j  =  2 ;   j  <  dansa[i] ;   j ++ ) {
        var   temp  =  tempArr[j - 1]  +  tempArr[j - 2] ;
        tempArr.push(  temp  ) ;
      }
      ans  =  tempArr[dansa[i] - 1] ; // The answer is the (dansa[i]-1)-th term.
    }
    // This console.log was also commented out in the original.
    // console.log(ans);

    // Push the calculated 'ans' modulo 1000000007 into the 'nantori' array.
    nantori.push(  ans  %  1000000007  ) ;
  }

  // The following debug line was commented out.
  // console.log(nantori);

  // Calculate the final result by multiplying all elements in 'nantori',
  // taking the modulo 1000000007 at each step to prevent overflow.
  var   ans  =  1 ;
  for ( var   i  =  0 ;   i  <  nantori.length ;   i ++ ) {
    ans  =  ans  *  nantori[i]  %  1000000007 ;
  }

  // Another commented-out debug statement.
  // console.log(mu);

  // Based on the value of 'mu', print the final result.
  if (  mu  !=  0  ) {
    console.log(  0  ) ; // If 'mu' is not zero, print 0.
  } else {
    // Otherwise, print the final calculated 'ans' modulo 1000000007.
    console.log(  ans  %  1000000007  ) ;
  }

}


// Read input from standard input and pass it to the main function.
main (  require('fs').readFileSync('/dev/stdin', 'utf8')  ) ;