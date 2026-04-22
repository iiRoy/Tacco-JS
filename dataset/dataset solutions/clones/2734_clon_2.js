function ProcessInput(sourceString)
{
  var parsedLines = sourceString.split("\n");
  var totalElements = parsedLines[0];

  parsedLines.shift();

  var dataCollection = parsedLines;

  for ( var currentIdx = 0; currentIdx < totalElements; currentIdx++ )
  {
    var modifiedSet = dataCollection.slice(0, dataCollection.length);
    modifiedSet.splice(currentIdx, 1);

    console.log(modifiedSet.reduce( (maxSoFar, nextItem) => maxSoFar > nextItem ? maxSoFar : nextItem ));
  }
}

ProcessInput( require("fs").readFileSync("/dev/stdin", "utf8") );