const generateSequence = (startPoint, endPoint) => Array.from({ length: endPoint - startPoint + 1 }, (_, indexOffset) => startPoint + indexOffset);

function ProcessInput(dataString) {
  const inputLines = dataString.split("\n");
  const numericValue = parseInt(inputLines[0], 10);

  let initialPairCount;
  let exclusionPredicate;

  if (numericValue % 2 === 0) {
    initialPairCount = (numericValue - 2) * numericValue / 2;
    exclusionPredicate = (firstItem, secondItem) => secondItem === numericValue + 1 - firstItem;
  } else {
    initialPairCount = (numericValue - 3) * (numericValue - 1) / 2 + (numericValue - 1);
    exclusionPredicate = (firstItem, secondItem) => secondItem === numericValue - firstItem;
  }

  const allFirstItems = generateSequence(1, numericValue);

  const constructedPairs = allFirstItems.flatMap(firstItem =>
    generateSequence(firstItem + 1, numericValue)
      .filter(secondItem => !exclusionPredicate(firstItem, secondItem))
      .map(secondItem => `${firstItem} ${secondItem}`)
  );

  const finalOutputComponents = [initialPairCount.toString(), ...constructedPairs];
  const combinedResult = finalOutputComponents.join("\n");

  console.log('%s', combinedResult);
  return combinedResult;
}

function debug(testCaseNumber){
  var input = document.getElementById("input"+testCaseNumber).value;
  var ans=ProcessInput(input);
  var result="WA";
  if(ans==document.getElementById("output"+testCaseNumber).value.split("\n")[0]){
    result="AC";
  }
  document.getElementById("result"+testCaseNumber).innerHTML=result;
}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
