// This script iterates to generate a standard multiplication table.
for ( let  multiplierOne  =  1 ;  multiplierOne  <=  9 ;  multiplierOne ++ )
{
    // The initial loop variable 'multiplierOne' represents the first value in the product.
    for ( let  multiplierTwo  =  1 ;  multiplierTwo  <=  9 ;  multiplierTwo ++ )
    {
        // The nested loop variable 'multiplierTwo' is the second value for the calculation.
        // The result of their product is then displayed using a system output function.
        globalThis.console.info ( multiplierOne  +  " times "  +  multiplierTwo  +  " equals "  +  ( multiplierOne  *  multiplierTwo ) ) ;
    }
}