// Obtener los elementos presentes en ambos arreglos.
function findIntersection
(
    firstArray,
    secondArray
)
{
    const result =
        [];

    for
    (
        let i = 0;
        i < firstArray.length;
        i++
    )
    {
        if
        (
            secondArray.includes
            (
                firstArray[i]
            )
            &&
            !result.includes
            (
                firstArray[i]
            )
        )
        {
            // Evitar resultados duplicados.
            result.push
            (
                firstArray[i]
            );
        }
    }

    return result;
}