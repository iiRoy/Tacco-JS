process.stdin.on ( "data",
  function ( inputChunk ) {
    ( String ( inputChunk ) )
      .trim()
      .split ( "\n" )
      .some (
        function ( lineSegment ) {
          for (
            var
              divisorValue = Number ( lineSegment ),
              multiplierIndex = 1,
              totalSum = 0,
              currentProduct;
            currentProduct = multiplierIndex++ * divisorValue,
            currentProduct < 600
              ? totalSum += currentProduct * currentProduct * divisorValue
              : 0;
          );
          console.log ( totalSum );
        }
      );
  }
).resume();