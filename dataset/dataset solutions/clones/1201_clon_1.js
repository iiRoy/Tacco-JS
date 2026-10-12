/* Combina dos listas previamente ordenadas. */
function mezclar ( lista , otra )
{
    const resultado=[];
    let posicionLista=0;
    let posicionOtra=0;

    // Compara los primeros elementos pendientes.
    while(
        posicionLista<lista.length&&
        posicionOtra<otra.length
    )
    {
        if(
            lista[posicionLista]<=
            otra[posicionOtra]
        )
        {
            resultado.push(
                lista[posicionLista]
            );
            posicionLista++;
        }
        else
        {
            resultado.push(
                otra[posicionOtra]
            );
            posicionOtra++;
        }
    }

    // Agrega los elementos restantes de la primera lista.
    while(posicionLista<lista.length)
    {
        resultado.push(lista[posicionLista]);
        posicionLista++;
    }

    // Agrega los elementos restantes de la segunda lista.
    while(posicionOtra<otra.length)
    {
        resultado.push(otra[posicionOtra]);
        posicionOtra++;
    }

    return resultado;
}