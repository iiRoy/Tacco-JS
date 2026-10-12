function calculateAndDisplayRatio(dataSource) {
  const inputLine = dataSource.split('\n').pop();
  
  const numericVal = Number(inputLine); 
  
  const ceilingDivisionResult = Math.ceil(numericVal / 2);
  
  const computedRatio = ceilingDivisionResult / numericVal;
  
  console.log(computedRatio.toFixed(11) + '\n');
}

calculateAndDisplayRatio(require("fs").readFileSync("/dev/stdin", "utf8"));
