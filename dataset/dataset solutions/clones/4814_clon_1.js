/*
 * Busca un valor dentro de una colección
 * previamente ordenada.
 */
function findValueIndex
(
    sortedValues,
    targetValue
)
{
    for
    (
        let i = 0;
        i < sortedValues.length;
        i++
    )
    {
        if
        (
            sortedValues[i]
            ===
            targetValue
        )
        {
            return i;
        }

        /*
         * Si el valor actual ya es mayor,
         * el objetivo no puede aparecer después.
         */
        if
        (
            sortedValues[i]
            >
            targetValue
        )
        {
            break;
        }
    }

    return -1;
}