/* Agrupa los elementos que ocupan la misma posición. */
function aparear ( unaLista , otra )
{
    const pares=[];

    // Solo se recorre la longitud de la lista más corta.
    const limite=Math.min(
        unaLista.length,
        otra.length
    );

    for(
        let posicion=0;
        posicion<limite;
        posicion++
    )
    {
        pares.push(
            [
                unaLista[posicion],
                otra[posicion]
            ]
        );
    }

    return pares;
}