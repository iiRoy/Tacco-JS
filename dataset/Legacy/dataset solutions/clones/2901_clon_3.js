function processInputData(rawInputString) {
  const DIVISOR_VALUE = 2;
  
  const performFloorDivision = (numerator, denominator) => Math.floor(numerator / denominator);

  let tokenizedInput = rawInputString.split(" "); 
  
  let valA = parseInt(tokenizedInput[0], 10);
  
  let valP = parseInt(tokenizedInput[1], 10);
  
  let halfValP = performFloorDivision(valP, DIVISOR_VALUE);
  
  let remainderValP = valP & 1; 
  
  let intermediateCalculationTerm = valA * 3 + remainderValP;
  
  let halfAdjustedValA = performFloorDivision(intermediateCalculationTerm, DIVISOR_VALUE);
  
  let remainderAdjustedValA = intermediateCalculationTerm % DIVISOR_VALUE; 
  
  console.log(halfValP + halfAdjustedValA);
}
     
// *この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
