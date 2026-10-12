/*
 * Calcula el producto de todos los enteros
 * comprendidos entre 1 y el número recibido.
 */
function calculateFactorial
(
    number
)
{
    let result =
        1;

    // Multiplicar cada factor.
    for
    (
        let factor = 2;
        factor <= number;
        factor++
    )
    {
        result
            *=
            factor;
    }

    // Devolver el factorial.
    return result;
}