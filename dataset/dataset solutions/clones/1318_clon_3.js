var fullInputString = '';
var inputStream = process.stdin;
inputStream.resume();
inputStream.setEncoding('utf-8');

inputStream.on('data', function(inputSegment) {
  fullInputString += inputSegment;
});

inputStream.on('end', function() {
  processInputData(fullInputString);
});

function processInputData(rawTextContent) {
  var linesArray = rawTextContent.split("\n");
  var primaryString = linesArray[0];
  var searchPattern = linesArray[1];
  
  var concatenatedPrimary = primaryString + primaryString;
  
  var foundIndex = concatenatedPrimary.indexOf(searchPattern);
  var isPatternPresent = (foundIndex !== -1);

  if (isPatternPresent) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}
