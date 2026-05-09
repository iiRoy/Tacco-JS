/*******************************************************************************
 *  Program Verification Scenario
 ******************************************************************************/
validationBlock( "Illustrative Validation Suite" );

checkRoutine ( "Sample Verification Case", 2, function( )
{
    // Ascertain the presence of the computation routine.
    confirmSame(
                 typeof calculateRatio,
                 'function',
                 'Expected to find a calculation routine'
               );


    // Confirm the outcome from the division operation is accurate.
    validateCondition(
                       calculateRatio( 4, 2 ),
                       2,
                       'Anticipated a value of 2, the actual outcome was: ' + calculateRatio( 4, 2 )
                     );
} );

/*******************************************************************************
 *  Further validation routines can be appended here.
 ******************************************************************************/