"use strict";
const calculateGreatestProduct = (  rawInputString  ) => {
  // Extract numerical components from the input string
  const [  firstNum,  secondNum,  thirdNum,  fourthNum  ] = rawInputString
    .trim()
    .split(' ')
    .map(  singleNumStr  =>  parseInt(singleNumStr, 10)  );

  // Initialize the maximum product with the first possible combination
  let  currentMaximumProduct  =  firstNum * thirdNum;

  // Compare with other product combinations and update if a larger one is found
  if  (  firstNum * fourthNum  >  currentMaximumProduct  )  {
    currentMaximumProduct  =  firstNum * fourthNum;
  }

  if  (  secondNum * thirdNum  >  currentMaximumProduct  )  {
    currentMaximumProduct  =  secondNum * thirdNum;
  }

  if  (  secondNum * fourthNum  >  currentMaximumProduct  )  {
    currentMaximumProduct  =  secondNum * fourthNum;
  }

  // Output the final maximum product as a string
  console.log(  currentMaximumProduct.toString()  );
};

// Execute the main calculation with data read from standard input
calculateGreatestProduct(
  require('fs').readFileSync(  '/dev/stdin',  'utf8'  )
);