/*
 * This JavaScript function processes input data
 * to solve a particular problem.
 * It's designed to be executed in a Node.js environment.
 */
function   Main(  input  )
{
  // First, split the entire input string by newline characters.
  // This creates an array where each element is a line from the input.
  input  =  input.split(  "\n"  )  ;

  // Check if the last element of the input array is an empty string.
  // This often happens when the input ends with a newline.
  if  (  input[  input.length  -  1  ]  ===  ''  )
  {
    // If it's an empty string, remove it from the array.
    input.pop(  )  ;
  }


  // Parse the first line of input to get N and K.
  // input[0] is split by space, then converted to numbers.
  const N  =  input[  0  ].split(  ' '  )[  0  ]  -  0  ;
  const K  =  input[  0  ].split(  ' '  )[  1  ]  -  0  ;


  // Process the second line of input to get array A.
  // Each element is converted to a number and then the array is sorted in ascending order.
  var   A  =  input[  1  ].split(  ' '  ).map(  e  =>
  {
    return  e  -  0  ;  // Convert string element to number
  }  ).sort(  (  a  ,  b  )  =>
  {
    return  a  -  b  ;  // Ascending sort
  }  )  ;


  // Process the third line of input to get array F.
  // Each element is converted to a number and then the array is sorted in descending order.
  var   F  =  input[  2  ].split(  ' '  ).map(  e  =>
  {
    return  e  -  0  ;  // Convert string element to number
  }  ).sort(  (  a  ,  b  )  =>
  {
    return  b  -  a  ;  // Descending sort
  }  )  ;


  // Initialize 'possible' variable, likely for a binary search range.
  var   possible  =  0  ;


  // Calculate the maximum possible product of corresponding elements from A and F
  // before any operations. This sets an initial upper bound for 'possible'.
  for  (  var   i  =  0  ;  i  <  N  ;  i  ++  )
  {
    possible  =  Math.max(  possible  ,  A[  i  ]  *  F[  i  ]  )  ;
  }


  // Initialize 'impossible' variable, representing a lower bound for the binary search.
  var   impossible  =  -1  ;

  // Declare temporary variables for the binary search.
  var   temp  ;
  var   sum  ;


  // Perform a binary search to find the minimum possible maximum product.
  // The loop continues as long as the difference between possible and impossible is greater than 1.
  while  (  possible  -  impossible  >  1  )
  {
    // Calculate the midpoint of the current search range.
    // Using Math.ceil to ensure 'temp' is always rounded up, which is crucial for
    // correctly narrowing the search space in some binary search implementations.
    temp  =  Math.ceil(  (  impossible  +  possible  )  /  2  )  ;

    // Reset sum for each iteration of the binary search.
    sum  =  0  ;


    // Iterate through the arrays to calculate the 'sum' based on 'temp'.
    // This sum represents the total number of operations needed to make all products
    // A[i] * F[i] less than or equal to 'temp'.
    for  (  var   i  =  0  ;  i  <  N  ;  i  ++  )
    {
      // Calculate operations needed for A[i] to satisfy A[i] * F[i] <= temp.
      // If F[i] is 0, this division would be problematic, but problem constraints
      // usually prevent F[i] from being 0 in such contexts.
      // Math.max(0, ...) ensures that we only add positive operations.
      sum  +=  Math.max(  0  ,  A[  i  ]  -  Math.floor(  temp  /  F[  i  ]  )  )  ;
    }


    // Based on the calculated 'sum', adjust the search range.
    // If the sum of operations is less than or equal to K,
    // then 'temp' is a possible maximum product, so we try for an even smaller one.
    if  (  sum  <=  K  )
    {
      possible  =  temp  ;
    }
    // If the sum of operations exceeds K, 'temp' is too small,
    // so we need a larger maximum product.
    else
    {
      impossible  =  temp  ;
    }
  }

  // After the binary search, 'possible' holds the minimum maximum product that satisfies the condition.
  console.log(  possible  )  ;
}


//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));