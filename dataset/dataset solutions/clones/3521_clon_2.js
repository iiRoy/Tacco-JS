// The entire input string is passed as an argument for processing.
function ProcessInput( rawData )
{
  let   valueList = rawData.split(' ') ;
  valueList = valueList.map( item => parseInt(item, 10) );

  // The numerical values are subsequently arranged in descending order: third <= second <= first
  let largestValue = Math.max(...valueList);
  valueList.splice(valueList.indexOf(largestValue), 1);

  let middleValue = Math.max(...valueList);
  valueList.splice(valueList.indexOf(middleValue), 1);

  let smallestValue = Math.max(...valueList);
  valueList.splice(valueList.indexOf(smallestValue), 1);

  console.log( parseInt(largestValue.toString() + middleValue.toString(), 10) + smallestValue );
}

// Do not modify the subsequent lines; they handle standard input and invoke the primary processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));