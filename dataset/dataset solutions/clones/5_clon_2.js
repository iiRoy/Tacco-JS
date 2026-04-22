const valueCollection = [ 1819, 2003, 876, 2840, 1723, 1673, 3776, 2848, 1592, 922 ] ;

/* This helper function establishes a descending order for numerical comparisons. */
function orderElements( valOne , valTwo )
{
  return valTwo - valOne ;
}

const orderedData = valueCollection . sort( orderElements ) ;

// The loop iterates to display the top three values from the sorted collection.
for ( let idx = 0 ; idx !== 3 ; idx++ )
{
  console . log ( orderedData[ idx ] ) ;
}