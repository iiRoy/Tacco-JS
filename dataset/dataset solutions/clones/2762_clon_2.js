const ProcessCoordinates =  ( rawData ) => {
  let lineData  =  rawData.split( "\n" ) ;
  let firstLineParts = lineData[0].split( " " );

  const pointCount = parseInt(firstLineParts[0], 10) ;
  const dimensionCount = parseInt(firstLineParts[1], 10) ;

  let coordinateSet = [];
  for ( let idxA = 0;  idxA < pointCount;  idxA++ ) {
    coordinateSet[idxA] = lineData[ idxA + 1 ].split( " " );
  }

  let integerDistancePairs = 0 ;

  for ( let idxA = 0; idxA < pointCount; idxA++ ) {
    for ( let idxB = 0; idxB < pointCount; idxB++ ) {
      if ( idxA === idxB ) {
        break ;
      } else {
        let squaredDifferences = [];
        let calculatedDistance = 0 ;

        for ( let dimIdx = 0; dimIdx < dimensionCount; dimIdx++ ) {
          squaredDifferences[dimIdx] = Math.pow(
            coordinateSet[idxA][dimIdx] - coordinateSet[idxB][dimIdx],
            2
          );
        }

        calculatedDistance = Math.sqrt(
          squaredDifferences.reduce((accumulator, currentSquare) => {
            return accumulator + currentSquare ;
          })
        );

        if ( Number.isInteger(calculatedDistance) ) {
          integerDistancePairs++;
        }
      }
    }
  }
  console.log(integerDistancePairs) ;
};

ProcessCoordinates(
  require("fs").readFileSync("/dev/stdin", "utf8")
) ;