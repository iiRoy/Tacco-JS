var reportOutput = console.log;

  if (typeof runtimeContext !== "undefined") {
    var rawContent = "";
    runtimeContext.stdin.resume();
    runtimeContext.stdin.setEncoding('utf8');
    runtimeContext.stdin.on('data', function(dataSlice) {
      rawContent += dataSlice;
    });
    runtimeContext.stdin.on('end', function() {
      prepareInput(rawContent);
    });
  }


function prepareInput(rawTextData) {
    var contentRows = rawTextData.split("\n");
    contentRows.shift();
    contentRows.pop();

    executeLogic(contentRows);
}


function executeLogic(processedRows) {
  var finalNumericSet = processedRows.pop().split(" ").map(function(itemVal) {
    return Number(itemVal);
  });

  reportOutput(finalNumericSet.sort(function(firstElement, secondElement) {
    return firstElement - secondElement;
  }).join(" "));
}