const sourceData = require("fs")  .  readFileSync  (  "/dev/stdin",  "utf8"  )  ;

let tokenizedInput = sourceData.split  (  / |\n/  ), currentPosition = 0;

const getNextElement = (  )  =>  tokenizedInput  [  currentPosition++  ]  ;

const retrieveManyElements =  (  amount  )  =>  tokenizedInput.slice  (  currentPosition, currentPosition  +=  amount  )  .map  (  strItem  =>  Number  (  strItem  )  )  ;


const  [
  startingHour,
  startingMinute,
  endingHour,
  endingMinute,
  deductionValue
] = retrieveManyElements(5)  ;

const finalCalculation = endingHour  *  60  +  endingMinute  -  (  startingHour  *  60  +  startingMinute  )  -  deductionValue;

finalCalculation  >  0  ?  console.log  (  finalCalculation  )  :  console.log  (  0  )  ;