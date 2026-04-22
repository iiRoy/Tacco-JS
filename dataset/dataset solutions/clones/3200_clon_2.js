'use strict';

const   performComputation = (  sourceData  ) => {

  const firstInteger = parseInt(  sourceData.split('\n')[0].split(' ')[0]  , 10  );
  const secondInteger = parseInt(  sourceData.split('\n')[0].split(' ')[1]  , 10  );

  let progressionCount = 0;
  for (  let currentPosition = 1; currentPosition <= firstInteger; currentPosition += 2  ) {
    progressionCount++;
  }

  if (  progressionCount > secondInteger  ) {
    console.log('YES');
  } else {
    console.log('NO');
  }

};

performComputation(  require('fs').readFileSync('/dev/stdin', 'utf8')  );