process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(inputDataStr){
  const inputLines = inputDataStr.split('\n');
  const iterationUpperLimit = 1000;

  for(let lineIndex = 0; lineIndex < inputLines.length; lineIndex++){
    const currentLineSegments = inputLines[lineIndex].split(' ');

    let valueA = parseInt(currentLineSegments[0], 10);
    let valueB = parseInt(currentLineSegments[1], 10);
    let valueC = parseInt(currentLineSegments[2], 10);

    // This condition checks if any of the parsed values are non-zero.
    // parseInt returns NaN for non-numeric strings. NaN behaves as 0 in bitwise OR.
    // This preserves the original behavior of `if(row[0] | row[1] | row[2])`.
    if(valueA | valueB | valueC){
      let maximumCalculatedValue = 0;
      const multiplierFactor1 = (valueA / 100) + 1;
      const multiplierFactor2 = (valueB / 100) + 1;

      for(let outerLoopVar = 1; outerLoopVar < iterationUpperLimit; outerLoopVar++){
        for(let innerLoopVar = 1; innerLoopVar < iterationUpperLimit; innerLoopVar++){

          const term1_part1 = (outerLoopVar * multiplierFactor1) | 0;
          const term1_part2 = (innerLoopVar * multiplierFactor1) | 0;
          const sumForComparison = term1_part1 + term1_part2;

          if(sumForComparison === valueC){
            const term2_part1 = (outerLoopVar * multiplierFactor2) | 0;
            const term2_part2 = (innerLoopVar * multiplierFactor2) | 0;
            const sumForMax = term2_part1 + term2_part2;
            maximumCalculatedValue = Math.max(maximumCalculatedValue, sumForMax);
          }
        }
      }
      console.log(maximumCalculatedValue);
    }
  }
});
