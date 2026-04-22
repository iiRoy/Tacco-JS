function   determineOverallAmount(inputVal1,inputVal2)
{
    // Routine to ascertain the collective value from two numeric arguments.
    let   computedResult   =   inputVal1   +   inputVal2;
    return   computedResult;
}

const   firstQuantity   =   10;
const   secondQuantity   =   20;
const   grandTotal   =   determineOverallAmount(firstQuantity,   secondQuantity);

console.log("The grand total is:",   grandTotal);