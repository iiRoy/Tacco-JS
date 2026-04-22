function  processInput ( rawData )
{

  var lines = rawData.split ( '\n' );
  lines.shift( );


  var spanCollection = [ ];
  var segmentCount = 1;

  for ( var idxA = 0; idxA < lines.length; idxA++ )
  {
    spanCollection[ idxA ] = [ ];

    for ( var charVal = lines[ idxA ][ 0 ]; charVal < lines[ idxA ][ 2 ]; charVal++ )
    {
      spanCollection[ idxA ].push ( Number.parseInt ( charVal, 10 ) );
    }
  }

  for ( var idxA = 0; idxA < spanCollection.length - 1; idxA++ )
  {
    console.log( spanCollection );

    if ( findCommonElements( spanCollection[ idxA ], spanCollection[ idxA + 1 ] ).length > 0 )
    {
      spanCollection[ idxA ] = findCommonElements ( spanCollection[ idxA ], spanCollection[ idxA + 1 ] );
      spanCollection.splice ( idxA + 1, 0x1 );
      idxA--;
    }
    else
    {
      segmentCount++;
    }
  }

  console.log ( Number.parseInt ( segmentCount, 10 ) );

}


function findCommonElements ( firstList, secondList )
{
  var sharedItems = [ ];
  for ( var k = 0 ; k < firstList.length; k++ )
  {
    if ( secondList.includes( firstList[ k ] ) )
    {
      sharedItems.push ( firstList[ k ] );
    }
  }
  return sharedItems;
}


processInput( require('node:fs').readFileSync('/dev/stdin', 'utf8') );