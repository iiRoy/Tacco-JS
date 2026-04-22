require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .split("\n")
  .some(
    function( inputLineData ) {
      pointDataArr = inputLineData.split(" ");
      if ( pointDataArr.length == 6 )
        (
          pointOneX = pointDataArr[0],
          pointOneY = pointDataArr[1],
          pointTwoX = pointDataArr[2],
          pointTwoY = pointDataArr[3],
          pointThreeX = pointDataArr[4],
          pointThreeY = pointDataArr[5],
          p1XSq = pointOneX * pointOneX,
          p1YSq = pointOneY * pointOneY,
          p2XSq = pointTwoX * pointTwoX,
          p2YSq = pointTwoY * pointTwoY,
          p3XSq = pointThreeX * pointThreeX,
          p3YSq = pointThreeY * pointThreeY,
          finalCenterX = (
            ( pointOneY - pointThreeY ) * ( p1YSq - p2YSq + p1XSq - p2XSq ) -
            ( pointOneY - pointTwoY ) * ( p1YSq - p3YSq + p1XSq - p3XSq )
          ) / (
            2 * ( pointOneY - pointThreeY ) * ( pointOneX - pointTwoX ) -
            2 * ( pointOneY - pointTwoY ) * ( pointOneX - pointThreeX )
          ),
          finalCenterY = (
            ( pointOneX - pointThreeX ) * ( p1XSq - p2XSq + p1YSq - p2YSq ) -
            ( pointOneX - pointTwoX ) * ( p1XSq - p3XSq + p1YSq - p3YSq )
          ) / (
            2 * ( pointOneX - pointThreeX ) * ( pointOneY - pointTwoY ) -
            2 * ( pointOneX - pointTwoX ) * ( pointOneY - pointThreeY )
          ),
          console.log(
            finalCenterX.toFixed(3),
            finalCenterY.toFixed(3),
            Math.sqrt(
              ( pointOneX - finalCenterX ) * ( pointOneX - finalCenterX ) +
              ( pointOneY - finalCenterY ) * ( pointOneY - finalCenterY )
            ).toFixed(3)
          )
        );
    }
  );