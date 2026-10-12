/*
 * Recorre la colección y conserva
 * el elemento más grande encontrado.
 */
function findMaximum
(
    values
)
{
    // No existe un máximo en una colección vacía.
    if
    (
        values.length
        ===
        0
    )
    {
        return null;
    }

    let maximum =
        values[
            0
        ];

    /*
     * Inspeccionar los elementos restantes.
     */
    for
    (
        let i = 1;
        i < values.length;
        i++
    )
    {
        if
        (
            values[i]
            >
            maximum
        )
        {
            maximum =
                values[i];
        }
    }

    // Entregar el resultado.
    return maximum;
}