console['log']( ( processingInput => {
  const [ [ totalNumbers ], numericSequence ] = processingInput
    .trim()
    .split ( `\n` )
    .map ( lineString => lineString.split ( ` ` ) .map ( valueString => valueString | 0 ) );

  numericSequence .sort ( ( primaryElement, secondaryElement ) => primaryElement - secondaryElement );

  const highestValue = numericSequence[ totalNumbers - 1 ];

  const markedStatus = Array ( highestValue + 1 ) .fill ( false );

  let finalTally = 0;

  for ( let currentPos = 0; currentPos < totalNumbers; currentPos++ ) {
    if ( markedStatus[ numericSequence[ currentPos ] ] ) {
      continue;
    }

    for ( let multipleCandidate = numericSequence[ currentPos ]; multipleCandidate <= highestValue; multipleCandidate += numericSequence[ currentPos ] ) {
      markedStatus[ multipleCandidate ] = true;
    }

    if ( numericSequence[ currentPos ] !== numericSequence[ currentPos + 1 ] ) {
      finalTally++;
    }
  }

  return `${ finalTally }`;

} ) ( require ( 'fs' ) .readFileSync ( '/dev/stdin', 'utf8' ) ) ) ;