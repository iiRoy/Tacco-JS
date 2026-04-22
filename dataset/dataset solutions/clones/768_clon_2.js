const   rawData   =  require('node:fs').readFileSync('/dev/stdin', 'utf8') ;

const dataRows = rawData .  trim( ) . split ( '\n' ) ;

const   [ countItems , budgetLimit ]  =  dataRows[0] . split ( ' ' ) . map ( Number ) ;

const   itemCosts   =  dataRows[1] . split ( ' ' ) . map ( Number ) ;

// Variable to keep track of the highest valid sum found
let bestSumFound = 0;

// Loop through each possible first item
for ( let idxA = 0 ; idxA < countItems ; idxA++ )
{
    // Loop through each possible second item
    for ( let idxB = 0 ; idxB < countItems ; idxB++ )
    {
        // Ensure items are distinct, their total cost is within the budget,
        // and this combination is better than previous findings.
        if ( (idxA !== idxB) && (budgetLimit >= itemCosts[idxA] + itemCosts[idxB]) && (bestSumFound < itemCosts[idxA] + itemCosts[idxB]) )
        {
            // Update the best sum if a new maximum is found
            bestSumFound = itemCosts[idxA] + itemCosts[idxB] ;
        }
    }
}

// Display the result: either the best sum or "NONE"
( bestSumFound > 0 ) ? console . log ( bestSumFound ) : console . log ( "NONE" ) ;