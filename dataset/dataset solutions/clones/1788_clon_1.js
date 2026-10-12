/* Suma todos los números desde cero hasta n. */
function sumaHasta ( n )
{
    if(
        !Number.isInteger(n)||
        n<0
    )
    {
        return null;
    }

    let suma=0;

    // Recorre los números en orden descendente.
    for(
        let actual=n;
        actual>=0;
        actual--
    )
    {
        suma+=actual;
    }

    return suma;
}