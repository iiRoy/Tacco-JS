let   sourceData   =   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   ;

const   initialPrincipal   =   100000   ;

const   defaultRate   =   5   ;

processFinancialLiability   (   initialPrincipal   ,   durationVariable   ,   defaultRate   )   ;

function   processFinancialLiability   (   currentObligation   ,   unusedRate   ,   periodDuration   )
{
    // The fixed multiplication factor for each cycle.
    const   growthFactor   =   1.05   ;

    // The unit for rounding the balance.
    const   thousandUnit   =   1000   ;

    for   (   let   loopCounter   =   0   ;   loopCounter   <   5   ;   loopCounter   ++   )
    {
        currentObligation   =   currentObligation   *   growthFactor   ;

        currentObligation   =   Math   .   ceil   (   currentObligation   /   thousandUnit   )   *   thousandUnit   ;
    }

    console   .   log   (   currentObligation   )   ;
}