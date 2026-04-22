// This JavaScript program solves a dynamic programming problem.
// It calculates the expected number of operations to reach a certain state.
// The main logic is encapsulated within the 'Main' function.

function Main  (  input  )   {

    // Pre-process the input string.
    // It's trimmed, split by newlines, and then each line is split by spaces.
    input = input
        .trim(  )
        .split(  "\n"  )
        .map(  function(x)  {  return  x.split(  " "  )  ;  }  )
    ;
    
    // Parse the first number from the input as N.
    let N  =  parseInt(  input[0][0]  ,  10  )  ;

    // Parse the second line of input into an array 'a' of integers.
    let a  =  input[1].map(  e  =>  parseInt(e,  10)  )  ;

    // Initialize 'countEach' array to store frequencies of 0, 1, 2, 3.
    let countEach  =  [  0  ,  0  ,  0  ,  0  ]  ;
    
    // Loop through array 'a' to populate 'countEach'.
    for  (  let i  =  0  ;  i  <  N  ;  i++  )  {
        countEach[a[i]]  ++  ;
    }

    // Calculate 'allCount', which is the sum of counts for 1, 2, and 3.
    allCount  =  countEach[1]  +  countEach[2]  +  countEach[3]  ;

    // Initialize 'DPrecord' for memoization.
    DPrecord  =  [  ]  ;
    DPrecord[allCount  -  1]  =  [  [  ]  ,  [allCount]  ]  ;

    // Output the result of the DP calculation for the initial state.
    console.log(  DP(countEach)  )  ;
    
    /*
     * The following line is a debug statement that has been commented out.
     * console.log(DPrecord);
     */
    
}




// This function implements the dynamic programming logic with memoization.
function  DP  (  countEach  )  {
    // The original debug console logs have been removed.
    // console.log("start");
    // console.log(countEach);

    let v  ;  // Variable to store indices of non-zero counts.
    let ans  ; // Variable to hold the computed answer for the current state.

    // Initialize the DPrecord structure for the current state if it doesn't exist.
    if  (  DPrecord[countEach[0]]  ==  null  )  {
        DPrecord[countEach[0]]  =  [  ]  ;
        DPrecord[countEach[0]][countEach[1]]  =  [  ]  ;
    }  else  if  (  DPrecord[countEach[0]][countEach[1]]  ==  null  )  {
        DPrecord[countEach[0]][countEach[1]]  =  [  ]  ;
    }

    // Another debug line removed for clarity.
    // console.log(DPrecord[countEach[0]][countEach[1]], "undefined?", DPrecord[countEach[0]][countEach[1]][countEach[2]]) ;

    // Check if the result for the current 'countEach' state is already memoized.
    if  (  DPrecord[countEach[0]][countEach[1]][countEach[2]]  ==  null  )  {
        v  =  returnExceptZero(  countEach  )  ; // Get all indices with non-zero counts.
        
        // If all four counts are non-zero, use a specific calculation.
        if  (  v.length  ===  4  )  {
            ans  =  1  +  (  DP(  [countEach[0] + 1, countEach[1] - 1, countEach[2], countEach[3]]  )  *  countEach[1]  +
                                DP(  [countEach[0], countEach[1] + 1, countEach[2] - 1, countEach[3]]  )  *  countEach[2]  +
                                DP(  [countEach[0], countEach[1], countEach[2] + 1, countEach[3] - 1]  )  *  countEach[3]  )  /  allCount  ;
            ans  /=  (  1  -  countEach[0]  /  allCount  )  ;
        }  else  {
            // If some counts are zero, iterate through the non-zero counts to calculate.
            ans  =  0  ;
            for  (  let i  of  v  )  {
                if  (  i  ===  0  )  continue  ;  // Skip if the count is for index 0.
                
                let ary  =  [  ]  ; // Create a temporary array for the next state.
                // console.log(countEach, "before"); // Debug line, removed.
                
                ary[i]  =  countEach[i]  -  1  ;
                ary[i - 1]  =  countEach[i - 1]  +  1  ;
                ary[(i + 1)  %  4]  =  countEach[(i + 1)  %  4]  ;
                ary[(i + 2)  %  4]  =  countEach[(i + 2)  %  4]  ;
                
                ans  +=  DP(ary)  *  countEach[i]  ;
            }
            ans  =  (  ans  /  allCount  )  +  1  ;
            ans  /=  (  1  -  countEach[0]  /  allCount  )  ;
        }
        
        // Store the newly computed answer in the DPrecord table for future use.
        DPrecord[countEach[0]][countEach[1]][countEach[2]]  =  ans  ;
        return  ans  ;

    }  else  {
        // If the result is already memoized, return the stored value directly.
        return  DPrecord[countEach[0]][countEach[1]][countEach[2]]  ;
    }
}




/**
 *  Helper function to find indices of non-zero elements in an array.
 *  @param {Array<number>} ary - The input array.
 *  @returns {Array<number>} An array containing the indices where the value is not zero.
 */
function  returnExceptZero  (  ary  )  {
    let ans  =  [  ]  ; // Initialize an empty array to hold the result.
    
    // Iterate through the input array from index 0 to its length.
    for  (  let i  =  0  ;  i  <  ary.length  ;  i++  )  {
        // If the element at the current index is not zero, add its index to 'ans'.
        if  (  ary[i]  !==  0  )  ans.push(i)  ;
    }
    
    return  ans  ; // Return the array of indices.
}




// Call the Main function, reading input synchronously from standard input.
Main(  require("fs").readFileSync(  "/dev/stdin"  ,  "utf8"  )  )  ;