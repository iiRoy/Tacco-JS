/* Suma los primeros n elementos de una lista. */
function sumarN ( n , numeros )
{
    if(
        !Number.isInteger(n)||
        n<0
    )
    {
        return null;
    }

    // Evita recorrer más elementos de los disponibles.
    const limite=Math.min(
        n,
        numeros.length
    );

    let suma=0;

    for(
        let posicion=0;
        posicion<limite;
        posicion++
    )
    {
        suma+=numeros[posicion];
    }

    return suma;
}