// The entire input data stream is passed into the 'rawData' parameter.
function ProcessInput(rawData)
{
  // The first line of input is in rawData[0], the second in rawData[1], and so on.
  rawData = rawData.split('\n') ;

  var     tempArray = rawData[1] .split(' ') ;

  // The parseInt function is used to convert string values into base-10 integers.
  var     numPeople = parseInt(rawData[0], 10) ;

  var totalDuration = parseInt(tempArray[0], 10) ;

  var finalResult = parseInt(tempArray[1], 10) ;


  for
  (
    var idx = 1;
    idx <= numPeople;
    idx++
  )
  {
    if (totalDuration % rawData[idx + 1] === 0)
    {
      finalResult += totalDuration / rawData[idx + 1] ;
    }
    else
    {
      var currentQuotient = totalDuration / parseInt(rawData[idx + 1], 10) ;
      finalResult += Math.floor(currentQuotient) + 1 ;
    }
  }

  // Displaying the computed outcome.
  console.log(finalResult) ;
}

// The following line should not be modified (it reads from standard input/output and invokes the primary processing function).
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));