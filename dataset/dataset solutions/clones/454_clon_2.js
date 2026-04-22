let sourceContent = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;

const processedLines = ( sourceContent . trim () ) . split ( "\n" ) ;

for ( let primaryCounter = 0 ; primaryCounter < processedLines.length ; primaryCounter ++ )
{
   const limitCriterion = processedLines[primaryCounter] - 0 ;

   if ( limitCriterion === 0 )
   {
      break ;
   }

   let runningTotal = 0 ;

   for ( let secondaryCounter = 1 ; secondaryCounter <= 12 ; secondaryCounter ++ )
   {
      const monthlyFigures = processedLines [ primaryCounter + secondaryCounter ] . split ( " " ) . map ( Number ) ;

      runningTotal += monthlyFigures [ 0 ] - monthlyFigures [ 1 ] ;

      if ( runningTotal >= limitCriterion )
      {
         break ;
      }
   }

   ( runningTotal >= limitCriterion )
      ? console . log ( secondaryCounter )
      : console . log ( "NA" ) ;

   primaryCounter += 12 ;
}