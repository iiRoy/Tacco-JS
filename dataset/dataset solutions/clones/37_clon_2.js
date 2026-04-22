var   rawData = require("fs") . readFileSync ("/dev/stdin",  "utf8" ) ;

var   lineCollection   =   ( rawData.trim() ) .split("\n")   ;


for  ( var currentLineIndex = 0 ; currentLineIndex < lineCollection.length ; currentLineIndex++ )
{

  var   upperLimit = lineCollection [ currentLineIndex ] ;

  var   primeCounter = 0 ;

  // Prepare an array for marking potential prime numbers.
  // The size is (upperLimit + 1) to include the upperLimit itself.
  var   sieveMarks   =   new Array ( parseInt(upperLimit) + 1 ) ;

  // Initialize all entries to '1', indicating they are potentially prime.
  for ( var indexValue = 0 ; indexValue <= parseInt(upperLimit) ; indexValue++ )
  {
    sieveMarks[ indexValue ] = 1 ;
  }


  // Implement a basic Sieve-like mechanism.
  // Iterate through numbers and mark their multiples as non-prime (0).
  for  ( var factorCandidate = 2 ;  factorCandidate <= parseInt(upperLimit) / 2 ;  factorCandidate++  )
  {
      for  ( var multipleMarker = factorCandidate * 2 ; multipleMarker <= parseInt(upperLimit) ; multipleMarker += factorCandidate )
      {
        sieveMarks[ multipleMarker ] = 0 ; // Set flag to zero for composite numbers.
      }
  }

  // Explicitly mark 0 and 1 as non-prime.
  sieveMarks[ 0 ] = 0 ;
  sieveMarks[ 1 ] = 0 ;


  // Traverse the marked array to sum up the actual prime numbers.
  for  ( var numberExaminer = 2 ;  numberExaminer <= parseInt(upperLimit) ;  numberExaminer++  )
  {
    if  ( sieveMarks[ numberExaminer ] == 1 )
    {
      // console.log(numberExaminer) // This line was commented out in the source.
      primeCounter++ ;
    }
  }

  console.log ( primeCounter ) ;

}