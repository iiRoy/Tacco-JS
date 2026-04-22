'use strict';
console.log(
    (
        function ( inputStrParam ) {
            const finalNumber = parseInt( inputStrParam.trim() , 10 ) ;
            const minStepsArray = Array( finalNumber + 1 ).fill( Infinity ) ;

            minStepsArray[ 0 ] = 0 ;

            for ( let idxCurrent = 0 ; idxCurrent < finalNumber ; idxCurrent++ )
            {
                if ( minStepsArray[ idxCurrent ] < minStepsArray[ idxCurrent + 1 ] )
                {
                    minStepsArray[ idxCurrent + 1 ] = minStepsArray[ idxCurrent ] + 1 ;
                }

                for ( let stepValue = 6 ; idxCurrent + stepValue <= finalNumber ; stepValue *= 6 )
                {
                    if ( minStepsArray[ idxCurrent ] < minStepsArray[ idxCurrent + stepValue ] )
                    {
                        minStepsArray[ idxCurrent + stepValue ] = minStepsArray[ idxCurrent ] + 1 ;
                    }
                }

                for ( let stepValue = 9 ; idxCurrent + stepValue <= finalNumber ; stepValue *= 9 )
                {
                    if ( minStepsArray[ idxCurrent ] < minStepsArray[ idxCurrent + stepValue ] )
                    {
                        minStepsArray[ idxCurrent + stepValue ] = minStepsArray[ idxCurrent ] + 1 ;
                    }
                }
            }

            return minStepsArray[ finalNumber ].toString() ;
        }
    )( require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' ) )
);