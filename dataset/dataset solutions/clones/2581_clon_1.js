/* This function calculates the sum of absolute values
 * of elements at specified indices in an array.
 * It's designed to sum up to three consecutive elements.
 */
function   SumAbs  (  i, tmp  )
{
    var sum   =   0  ;
    // Calculate the absolute value of the current element
    sum  =  Math.abs  (  tmp [  i  ]  )  ;

        if  (  i + 1  <  tmp.length  )
        {
        sum  +=  Math.abs  (  tmp [  i+1  ]  )  ;
        }

    // Check for the third element in the sequence
    if  (  i + 2  <  tmp.length  )
    {
        sum  +=  Math.abs  (  tmp [  i+2  ]  )  ;
    }


    return  sum  ;
}


// This function computes the "happiness sum" of an array.
// It sums all elements and then subtracts the array's length.
function HappySum(  tmp  )
{
  var sum  =  tmp.reduce  (  function  (  a, b  )
  {
                return  a + b  ;
      }  )  ;

  sum  -=  tmp.length  ;

  return  sum  ;
}




function  Main  (  input  )
{
  // Split the input string by newline characters
  input  =  input.split  (  "\n"  )  ;

  inputStr  =  input [  0  ]  .split  (  " "  )  ;

  const N  =  Number.parseInt  (  inputStr [  0  ]  )  ;

  const K  =  Number.parseInt  (  inputStr [  1  ]  )  ;


  inputStr  =  input [  1  ]  .split  (  " "  )  ;


  const S  =  inputStr [  0  ]  ;


  // The string S is processed to create a weighted array.
  // 'L' is considered positive, 'R' was likely intended to be negative (based on commented-out logic).
  var tmp  =  [  ]  ;
  var lst  =  S.substr  (  0,1  )
  var cnt  =  1  ;

  // Iterate through the string to group consecutive identical characters
  for  (  var i  =  1  ;  i  <  N  ;  i++  )
  {
    if  (  S.substr  (  i,1  )  !=  S.substr  (  i-1,1  )  )
    {
      // Original logic for 'R' was commented out.
      // if( S.substr(i-1,1) === 'R'){
      //   cnt *= -1;
      // }
      tmp.push  (  cnt  )  ;
      cnt  =  0  ;
    }

    cnt  +=  1  ;
  }

  // Handle the very last segment of characters if it exists
  if  (  cnt  !=  0  )
  {
      tmp.push  (  cnt  )  ;
  }


  /*
   * This section contains the core processing logic for the problem.
   * It determines the final 'ans' value based on 'tmp' array manipulations.
   */
  var ans  =  0  ;
  var cnt  =  0  ; // This 'cnt' is a different variable from the one above.

  if  (  tmp.length  <=  2  )
  {
    ans  =  N-1  ;
  }
  else
  {
    // This is the cumulative sum processing part.
    // It iterates K times to modify the 'tmp' array.
    for  (  var j  =  0  ;  j  <  K  ;  j++  )
    {
      var last  =  SumAbs  (  0,tmp  )  ;
      var posi  =  0  ;

      // Find the position that yields the maximum SumAbs value
      for  (  var i  =  1  ;  i  <  tmp.length  ;  i++  )
      {
        var now  =  SumAbs  (  1,tmp  )  ;
        if  (  last  <  now  )
        {
          last  =  now  ;
          posi  =  i  ;
        }
      }

      // Replace elements in the array based on the calculated position and sum
      tmp.splice  (  posi,3,last  )  ;

      // Check for an early exit condition
      if  (  N-1  ===  HappySum  (  tmp  )  )
      {
        break  ;
      }
    }

    // After the loop, calculate the final answer.
    ans  =  HappySum  (  tmp  )  ;
  }
  console.log  (  ans  )  ;
}

Main  (  require  (  "fs"  )  .readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;