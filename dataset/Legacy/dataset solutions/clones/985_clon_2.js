process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (inputBuffer) {
  let inputRows = inputBuffer.toString().split('\n');

  let elementCount = inputRows[0];
  let dataArray = inputRows[1].split(' ');

  console.log(dataArray.join(" "));

  for (let outerIndex = 1; outerIndex < elementCount; outerIndex++) {
    let currentValue = dataArray[outerIndex];
    let innerIndex = outerIndex - 1;

    while (innerIndex >= 0 && parseInt(dataArray[innerIndex], 10) > parseInt(currentValue, 10)) {
      dataArray[innerIndex + 1] = dataArray[innerIndex];
      innerIndex--;
    }
    dataArray[innerIndex + 1] = currentValue;
    console.log(dataArray.join(" "));
  }
});
