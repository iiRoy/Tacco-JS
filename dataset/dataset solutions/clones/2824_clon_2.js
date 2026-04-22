function processInput ( rawData ) {
  const   lines = rawData .split('\n');

  const firstLineValues = lines[0].split(' ')
                           .map(  valStr => parseInt(valStr, 10)  );

  const countMax    = firstLineValues[0] + 1;
  const targetSum   = firstLineValues[1];

  const numberSequence = lines[1].split(' ').map( numString => parseInt(numString, 10) );


  for ( let idx = 1;  idx <= countMax;  idx++ ) {
    let currentAccumulation = numberSequence.slice(0, idx).reduce( (accumulator, currentValue) => accumulator + currentValue );

    if ( currentAccumulation >= targetSum ) {
      console.log( idx );
      return;
    }
  }

  console.log( countMax - 1 );
}

processInput(
  require('fs')
    .readFileSync('/dev/stdin', 'utf8')
);