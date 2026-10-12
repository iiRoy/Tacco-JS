/*
 * Probar todos los segmentos del histograma
 * y calcular el área de cada uno.
 */
function calculateLargestRectangle
(
    heights
)
{
    let maximumArea =
        0;

    // Seleccionar el inicio del segmento.
    for
    (
        let startingPosition = 0;
        startingPosition < heights.length;
        startingPosition++
    )
    {
        // Seleccionar el final del segmento.
        for
        (
            let endingPosition = startingPosition;
            endingPosition < heights.length;
            endingPosition++
        )
        {
            let minimumHeight =
                Infinity;

            // Buscar la barra más baja.
            for
            (
                let currentPosition = startingPosition;
                currentPosition <= endingPosition;
                currentPosition++
            )
            {
                minimumHeight =
                    Math.min
                    (
                        minimumHeight,
                        heights[currentPosition]
                    );
            }

            const rectangleWidth =
                endingPosition
                -
                startingPosition
                +
                1;

            const rectangleArea =
                minimumHeight
                *
                rectangleWidth;

            if
            (
                rectangleArea
                >
                maximumArea
            )
            {
                maximumArea =
                    rectangleArea;
            }
        }
    }

    return maximumArea;
}