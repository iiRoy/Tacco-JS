'use strict';

function processInputData(rawDataString)
{
  const linesOfData = rawDataString .trim() .split('\n') ;
  const configParams = linesOfData[0] .split(' ') .map( strNum => Number(strNum) );
  const participantTypes = linesOfData[1] .split('');
  const passStatusRecords = [];

  let foreignersCounter = 0;

  for ( let currentParticipantIndex = 0; currentParticipantIndex < participantTypes.length; currentParticipantIndex++ )
  {
    if ( participantTypes[currentParticipantIndex] === 'a' )
    {
      if ( currentParticipantIndex + 1 < configParams[1] + configParams[2] )
      {
        passStatusRecords[currentParticipantIndex] = 'Yes\n';
        continue;
      }
      else
      {
        passStatusRecords[currentParticipantIndex] = 'No\n';
      }
    }
    else if ( participantTypes[currentParticipantIndex] === 'b' )
    {
      for ( let previousParticipantIndex = 0; previousParticipantIndex < currentParticipantIndex; previousParticipantIndex++ )
      {
        if ( participantTypes[previousParticipantIndex] === 'b' )
        {
          foreignersCounter++;
        }
      }
      if ( currentParticipantIndex + 1 < configParams[1] + configParams[2] && currentParticipantIndex + 1 < foreignersCounter )
      {
        passStatusRecords[currentParticipantIndex] = 'Yes\n';
        continue;
      }
      else
      {
        passStatusRecords[currentParticipantIndex] = 'No\n';
      }
      foreignersCounter = 0;
    }
    else
    {
      passStatusRecords[currentParticipantIndex] = 'No\n';
      continue;
    }
    console.log( passStatusRecords[currentParticipantIndex] );
  }
}

processInputData( require("fs").readFileSync("/dev/stdin", "utf8") );