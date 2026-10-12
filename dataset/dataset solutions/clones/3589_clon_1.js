/*
 * Calcula la cantidad mínima de operaciones
 * necesarias para transformar una cadena.
 */
function calculateEditDistance
(
    source,
    target
)
{
    const rowCount =
        source.length
        +
        1;

    const columnCount =
        target.length
        +
        1;

    // Crear la tabla de resultados parciales.
    const distanceTable =
        Array.from
        (
            {
                length:
                    rowCount
            },
            () =>
                new Array
                (
                    columnCount
                )
                .fill
                (
                    0
                )
        );

    // Inicializar la primera columna.
    for
    (
        let row = 0;
        row < rowCount;
        row++
    )
    {
        distanceTable[row][0] =
            row;
    }

    // Inicializar la primera fila.
    for
    (
        let column = 0;
        column < columnCount;
        column++
    )
    {
        distanceTable[0][column] =
            column;
    }

    // Calcular las distancias restantes.
    for
    (
        let row = 1;
        row < rowCount;
        row++
    )
    {
        for
        (
            let column = 1;
            column < columnCount;
            column++
        )
        {
            const sourceCharacter =
                source[row - 1];

            const targetCharacter =
                target[column - 1];

            if
            (
                sourceCharacter
                ===
                targetCharacter
            )
            {
                distanceTable[row][column] =
                    distanceTable
                    [
                        row - 1
                    ]
                    [
                        column - 1
                    ];
            }
            else
            {
                const deletionCost =
                    distanceTable
                    [
                        row - 1
                    ]
                    [
                        column
                    ]
                    +
                    1;

                const insertionCost =
                    distanceTable
                    [
                        row
                    ]
                    [
                        column - 1
                    ]
                    +
                    1;

                const substitutionCost =
                    distanceTable
                    [
                        row - 1
                    ]
                    [
                        column - 1
                    ]
                    +
                    1;

                distanceTable[row][column] =
                    Math.min
                    (
                        deletionCost,
                        insertionCost,
                        substitutionCost
                    );
            }
        }
    }

    return distanceTable
    [
        rowCount - 1
    ]
    [
        columnCount - 1
    ];
}