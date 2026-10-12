/* Acumula valores únicos directamente en la semilla. */
function sinDuplicadosConSemilla ( lista , resultado )
{
    // Recorre la lista utilizando un índice.
    function acumular ( posicion )
    {
        if(posicion>=lista.length)
        {
            return resultado;
        }

        const elemento=lista[posicion];

        if(!resultado.includes(elemento))
        {
            resultado.push(elemento);
        }

        // La llamada recursiva es la última operación.
        return acumular(
            posicion+1
        );
    }

    return acumular(0);
}