evaluateBlock ( 'presentCashRoutine' , function ( )
{

    verifyScenario ( 'handles petite numeric inputs' , function ( )
    {

        checkValue ( monetaryTools . presentCash ( 123 ) ) . isEquivalentTo ( '$123.00' ) ;
        checkValue ( monetaryTools . presentCash ( 123.45 ) ) . isEquivalentTo ( '$123.45' ) ;
        checkValue ( monetaryTools . presentCash ( 12345.67 ) ) . isEquivalentTo ( '$12,345.67' ) ;

    } ) ;

    verifyScenario ( 'processes unfavorable numeric inputs' , function ( )
    {

        checkValue ( monetaryTools . presentCash ( -123 ) ) . isEquivalentTo ( '$-123.00' ) ;
        checkValue ( monetaryTools . presentCash ( -123.45 ) ) . isEquivalentTo ( '$-123.45' ) ;
        checkValue ( monetaryTools . presentCash ( -12345.67 ) ) . isEquivalentTo ( '$-12,345.67' ) ;

    } ) ;

    verifyScenario ( 'permits zero decimal places without default override' , function ( )
    {
        checkValue ( monetaryTools . presentCash ( 5318008 , "$" , 0 ) ) . isEquivalentTo ( '$5,318,008' ) ;
    } ) ;

} ) ;