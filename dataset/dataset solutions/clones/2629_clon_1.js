/*
 * Construye un arreglo sin elementos repetidos.
 */
function removeDuplicates
(
    values
)
{
    const uniqueValues =
        [];

    // Examinar cada elemento de entrada.
    for
    (
        let i = 0;
        i < values.length;
        i++
    )
    {
        if
        (
            !uniqueValues.includes
            (
                values[i]
            )
        )
        {
            // Conservar únicamente la primera aparición.
            uniqueValues.push
            (
                values[i]
            );
        }
    }

    return uniqueValues;
}