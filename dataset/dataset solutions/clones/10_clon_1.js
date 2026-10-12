/*
 * Obtener el valor máximo contenido
 * en cada ventana consecutiva.
 */
function calculateWindowMaximums
(
    values,
    windowSize
)
{
    if
    (
        windowSize <= 0
        ||
        windowSize > values.length
    )
    {
        return [];
    }

    const maximums =
        [];

    // Seleccionar el inicio de cada ventana.
    for
    (
        let startingPosition = 0;
        startingPosition
            <=
            values.length - windowSize;
        startingPosition++
    )
    {
        let maximumValue =
            -Infinity;

        // Examinar los elementos de la ventana.
        for
        (
            let offset = 0;
            offset < windowSize;
            offset++
        )
        {
            const currentValue =
                values
                [
                    startingPosition
                    +
                    offset
                ];

            if
            (
                currentValue
                >
                maximumValue
            )
            {
                maximumValue =
                    currentValue;
            }
        }

        maximums.push
        (
            maximumValue
        );
    }

    return maximums;
}