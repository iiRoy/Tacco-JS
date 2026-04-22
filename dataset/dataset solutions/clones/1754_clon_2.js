process.stdout.write(
  (function ( rawInput ) {
    const [
      [ totalLines ],
      numberSeries
    ] = rawInput
      .trim()
      .split('\n')
      .map(
        ( lineDatum ) =>
          lineDatum
            .split(' ')
            .map(
              ( numDatum ) =>
                parseInt(numDatum, 10)
            )
      );

    let xorTotal = numberSeries[0];

    for (
      let currentPosition = 1;
      currentPosition < totalLines;
      currentPosition++
    ) {
      xorTotal ^= numberSeries[currentPosition];
    }

    return numberSeries
      .map(
        ( elementVal ) =>
          elementVal ^ xorTotal
      )
      .join(' ');

  })(
    require('fs')
      .readFileSync('/dev/stdin', 'utf8')
  ) + '\n'
);