function ProcessTextData(sourceContent) {
  var limitLength = parseInt(sourceContent.split('\n')[0].trim());
  var processedSegment = sourceContent.split('\n')[1].trim();

  if (processedSegment.length <= limitLength) {
    console.log(processedSegment);
  }
  else {
    console.log(processedSegment.substring(0, limitLength) + '...');
  }
}

ProcessTextData(require("fs").readFileSync("/dev/stdin", "utf8"));