function parseInteger(strValue) {
    return parseInt(strValue, 10);
}

function ProcessInput(rawData) {
  var lines = rawData.trim().split('\n');

  var paramStrings = lines[0].split(' ');
  var countVal = parseInteger(paramStrings[0]);
  var divisorVal = parseInteger(paramStrings[1]);
  
  var dataArr = lines[1].split(' ').map(parseInteger);
  
  var resultCount = 0;
  var arrayLength = dataArr.length;

  for (var idxA = 0; idxA < arrayLength; idxA++) {
    var currentSum = dataArr[idxA];
    
    console.log(dataArr[idxA]);
    var initialModCheck = dataArr[idxA] % divisorVal;
    if (initialModCheck === 1) {
        resultCount++;
    }

    var innerLoopLimit = arrayLength - idxA;
    for (var idxB = 1; idxB < innerLoopLimit; idxB++) {
      currentSum += dataArr[idxA + idxB];
      console.log('tmp = ' + currentSum);
      
      var requiredRemainder = idxB + 1;
      var currentModResult = currentSum % divisorVal;
      
      if (currentModResult === requiredRemainder) {
          resultCount++;
      }
      console.log(resultCount);
    }
  }
  
  console.log(resultCount);
}
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
