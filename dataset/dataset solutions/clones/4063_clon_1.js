/*
 * Rotación de una matriz cuadrada
 * noventa grados en sentido horario.
 */
function rotateMatrixClockwise
(
    matrix
)
{
    const size =
        matrix.length;

    // Crear la matriz de salida.
    const rotatedMatrix =
        Array.from
        (
            {
                length:
                    size
            },
            () =>
                new Array
                (
                    size
                )
        );

    // Recorrer las filas originales.
    for
    (
        let row = 0;
        row < size;
        row++
    )
    {
        // Recorrer las columnas originales.
        for
        (
            let column = 0;
            column < size;
            column++
        )
        {
            const destinationRow =
                column;

            const destinationColumn =
                size
                -
                1
                -
                row;

            rotatedMatrix
            [
                destinationRow
            ]
            [
                destinationColumn
            ]
            =
                matrix
                [
                    row
                ]
                [
                    column
                ];
        }
    }

    return rotatedMatrix;
}