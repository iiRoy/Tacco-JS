function computeProduct( numInput )
{
  var resultProduct = 1 ;
  for ( var loopCounter = 1 ; loopCounter <= numInput ; loopCounter ++ )
  {
    resultProduct *= loopCounter ;
  }
  return resultProduct ;
}

var computedCeiling ;

function assessDivisorCount( testNumber )
{
	var tally = 0 ;
	for ( var divIter = 1 ; divIter < computedCeiling ; divIter ++ )
	{
		if ( testNumber % divIter === 0 )
		{
			tally ++ ;
		}
	}
	return tally ;
}

function orchestrateExecution( programArgument )
{
	programArgument = Number ( programArgument . split ( "\n" ) [ 0 ] ) ;

	var initialArray = [ 0 , 3 , 5 , 7 ] ;
	var overallTally = 0 ;

	computedCeiling = computeProduct ( programArgument ) ;
	for ( var outerIdx = 1 ; outerIdx < computedCeiling ; outerIdx ++ )
	{
		if ( computedCeiling % outerIdx === 0 )
		{
			if ( assessDivisorCount ( outerIdx ) === 75 )
			{
				overallTally ++ ;
			}
		}
	}

	console . log ( overallTally ) ;
}
orchestrateExecution ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;