/*
 * Calcular el agua acumulada sobre
 * cada posición del histograma.
 */
function calculateTrappedWater
(
    heights
)
{
    let totalWater =
        0;

    // No es necesario revisar los extremos.
    for
    (
        let currentPosition = 1;
        currentPosition < heights.length - 1;
        currentPosition++
    )
    {
        let maximumLeftHeight =
            0;

        let maximumRightHeight =
            0;

        // Buscar la mayor altura a la izquierda.
        for
        (
            let leftPosition = 0;
            leftPosition < currentPosition;
            leftPosition++
        )
        {
            maximumLeftHeight =
                Math.max
                (
                    maximumLeftHeight,
                    heights[leftPosition]
                );
        }

        // Buscar la mayor altura a la derecha.
        for
        (
            let rightPosition = currentPosition + 1;
            rightPosition < heights.length;
            rightPosition++
        )
        {
            maximumRightHeight =
                Math.max
                (
                    maximumRightHeight,
                    heights[rightPosition]
                );
        }

        const waterLevel =
            Math.min
            (
                maximumLeftHeight,
                maximumRightHeight
            );

        const waterAtCurrentPosition =
            Math.max
            (
                0,
                waterLevel
                -
                heights[currentPosition]
            );

        totalWater +=
            waterAtCurrentPosition;
    }

    return totalWater;
}