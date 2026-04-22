const   computePolynomial   =   (   sourceText   )   =>
{

    const   baseValue   =   Number(   sourceText.trim()   ) ;


    return   baseValue   +   baseValue   **   2   +   baseValue   **   3 ;

}

console.log (   computePolynomial(   require (   'fs'   ) . readFileSync (   '/dev/stdin' ,   'utf8'   )   )   ) ;