var     rawData =   require   (   'fs'   ) .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   ;
var   numericValues =   rawData .   split (   " "   ) .   map (   Number   )   ;
var firstNum = numericValues [ 0 ] ;
var   secondNum = numericValues [ 1 ] ;

if (   principalVal   ===   secondaryVal   )
{
    console .   log   (   principalVal   )   ;
    return   ;
}

var principalVal =   Math .   max   (   firstNum   ,   secondNum   )   ;
var secondaryVal =   Math .   min   (   firstNum   ,   secondNum   )   ;
var modValue = principalVal % secondaryVal ;

for (   var   divisorCandidate = modValue   ;   divisorCandidate   >=   1   ;   divisorCandidate --   )
{
    if   (   principalVal % divisorCandidate   ==   0   &&   secondaryVal % divisorCandidate   ==   0   )
    {
        break   ;
    }
}
console .   log   (   divisorCandidate   )   ;