const processData=(rawData)=>{
  const numericValues
    =rawData.split("\n")
    .split(" ")
    .map((tokenString)=>{
      return parseInt(tokenString,10);
    });

  for
  (
    let operationCount=1;
    numericValues.every((currentNumber)=>{return currentNumber%2===0;});
    operationCount+=1
  )
  {
    console.log(operationCount);
  }
};
processData(require('fs').readFileSync('/dev/stdin','utf8'));