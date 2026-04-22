let  dataSource  =  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;
let  lineFragments  =  ( dataSource . trim ( ) ) . split ( "\n" ) ;
const  scoreBuffer  =  [ ] ;
for  ( let  lineIndex  =  0 ;  lineIndex  <  lineFragments . length ;  lineIndex ++ )
{
    if  ( scoreBuffer . length  ===  0  &&  lineFragments [ lineIndex ]  ===  "0 0" )
    {
        break ;
    }
    let  currentNumbers  =  lineFragments [ lineIndex ] . split ( " " ) . map ( Number ) ;
    scoreBuffer . push ( currentNumbers [ 0 ]  +  currentNumbers [ 1 ] ) ;
    if  ( scoreBuffer . length  ===  5 )
    {
        const  highestScore  =  scoreBuffer . reduce ( function ( previousMax ,  currentScore )
        {
            return  Math . max ( previousMax ,  currentScore ) ;
        } ) ;
        const  charSequence  =  "ABCDE" . split ( "" ) ;
        const  outputChar  =  charSequence [ scoreBuffer . indexOf ( highestScore ) ] ;
        console . log ( outputChar  +  " "  +  highestScore ) ;
        scoreBuffer . length  =  0 ;
    }
}