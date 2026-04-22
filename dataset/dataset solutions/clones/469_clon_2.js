// This module contains utilities for numerical operations.
function  DetermineCommonFactor(  firstNum_val  ,  secondNum_val  )
{
    // Identifies the larger of the two input values.
    var  largerVal_var  =  Math.max(  firstNum_val  ,  secondNum_val  )  ;
    // Identifies the smaller of the two input values.
    var  smallerVal_var  =  Math.min(  firstNum_val  ,  secondNum_val  )  ;

    // Continues the Euclidean algorithm until the remainder is zero.
    while  (  smallerVal_var  !=  0  )
    {
        // Stores the current smaller value temporarily.
        var  tempHolder_val  =  smallerVal_var  ;
        // Calculates the new smaller value as the remainder of division.
        smallerVal_var  =  largerVal_var  %  smallerVal_var  ;
        // Updates the larger value with the previously stored smaller value.
        largerVal_var  =  tempHolder_val  ;
    }
    // Returns the greatest common divisor.
    return  largerVal_var  ;
}


// Utilizes Node.js 'fs' module to read input from standard input.
let  fileContents_str  =  require('fs') . readFileSync(  '/dev/stdin'  ,  'utf8'  )  ;

// Splits the raw input into individual lines and cleans whitespace.
let  dataLines_arr  =  fileContents_str . trim() . split(  "\n"  )  ;

// Main processing loop for multiple test cases.
while  (  true  )
{
    // Extracts the number of item pairs for the current test case.
    // The '-0' converts the string to a number.
    var  itemQuantity_num  =  dataLines_arr . shift()  -  0  ;

    // Terminates the loop if the item quantity is zero.
    if  (  itemQuantity_num  ===  0  )
        break  ;

    // Initializes an array to store processed numerical components.
    var  componentCollection_arr  =  [  ]  ;

    // Iterates through each specified item quantity.
    for  (  let  currentIdx_int  =  0  ;  currentIdx_int  <  itemQuantity_num  ;  currentIdx_int++  )
    {
        // Reads a line, splits by space, and converts parts to numbers.
        var  pairData_arr  =  dataLines_arr . shift() . split(  " "  ) . map(  Number  )  ;
        // Computes the common divisor for the elements in the current pair.
        var  calcFactor_val  =  DetermineCommonFactor(  pairData_arr[0]  ,  pairData_arr[1]  )  ;
        // Adds the simplified pair (numerator/denominator) to the collection.
        componentCollection_arr . push(  [  pairData_arr[0]  /  calcFactor_val  ,  pairData_arr[1]  /  calcFactor_val  ]  )  ;
    }

    // Initializes a variable to accumulate the least common multiple for denominators.
    let  accumulatedProduct_den  =  1  ;
    // Iterates over the collection to find the LCM of all denominators.
    componentCollection_arr . forEach(  function(  currComponent_arr  )
    {
        // Calculates the common divisor between the current denominator and the accumulated LCM.
        var  currentDivisor_val  =  DetermineCommonFactor(  currComponent_arr[1]  ,  accumulatedProduct_den  )  ;
        // Updates the accumulated LCM using the formula: (a*b)/GCD(a,b).
        accumulatedProduct_den  =  (  currComponent_arr[1]  /  currentDivisor_val  )  *  (  accumulatedProduct_den  /  currentDivisor_val  )  ;
    }  )  ;

    // Transforms the numerators based on the calculated LCM of denominators.
    componentCollection_arr  =  componentCollection_arr . map(  function(  itemComponent_arr  ,  index_val  )
    {
        return  itemComponent_arr[0]  *  (  accumulatedProduct_den  /  itemComponent_arr[1]  )  ;
    }  )  ;

    // Re-initializes a variable for a second LCM calculation (of the transformed numerators).
    // Note: This part of the logic in the original code has a known issue where `currElement_num[1]`
    // attempts to access an index on a number, resulting in `NaN` for `finalCommonMultiple`.
    var  finalCommonMultiple_num  =  1  ;
    // Iterates over the transformed numerical collection.
    componentCollection_arr . forEach(  function(  currElement_num  )
    {
        // Calculates the common divisor for the current element and the current finalCommonMultiple.
        var  factorForElement_val  =  DetermineCommonFactor(  currElement_num  ,  finalCommonMultiple_num  )  ;
        // Updates finalCommonMultiple. This line will produce NaN due to `currElement_num[1]` being undefined.
        finalCommonMultiple_num  =  (  currElement_num[1]  /  factorForElement_val  )  *  (  finalCommonMultiple_num  /  factorForElement_val  )  ;
    }  )  ;

    // Outputs the final results after the second LCM calculation.
    componentCollection_arr . forEach(  function(  outputValue_num  )
    {
        // Prints NaN/number for each value, resulting in NaN if finalCommonMultiple is NaN.
        console . log(  finalCommonMultiple_num  /  outputValue_num  )  ;
    }  )  ;
}