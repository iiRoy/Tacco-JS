/* Búsqueda de un valor dentro del arreglo. */
function contains ( sortedValues , target )
{
    for (
        let index = 0 ;
        index < sortedValues . length ;
        index ++
    )
    {
        // Compara el elemento actual con el objetivo.
        if ( sortedValues [ index ] === target )
        {
            return true ;
        }
    }

    // El valor no fue encontrado.
    return false ;
}