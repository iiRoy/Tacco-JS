/*
 * Validar las filas, columnas y regiones
 * de un tablero de Sudoku.
 */
function isValidSudoku
(
    board
)
{
    // Revisar todas las filas.
    for
    (
        let row = 0;
        row < 9;
        row++
    )
    {
        const detectedValues =
            new Set();

        for
        (
            let column = 0;
            column < 9;
            column++
        )
        {
            const value =
                board[row][column];

            if
            (
                value === "."
            )
            {
                continue;
            }

            if
            (
                detectedValues.has(value)
            )
            {
                return false;
            }

            detectedValues.add(value);
        }
    }

    // Revisar todas las columnas.
    for
    (
        let column = 0;
        column < 9;
        column++
    )
    {
        const detectedValues =
            new Set();

        for
        (
            let row = 0;
            row < 9;
            row++
        )
        {
            const value =
                board[row][column];

            if
            (
                value === "."
            )
            {
                continue;
            }

            if
            (
                detectedValues.has(value)
            )
            {
                return false;
            }

            detectedValues.add(value);
        }
    }

    // Revisar cada región de tres por tres.
    for
    (
        let boxRow = 0;
        boxRow < 3;
        boxRow++
    )
    {
        for
        (
            let boxColumn = 0;
            boxColumn < 3;
            boxColumn++
        )
        {
            const detectedValues =
                new Set();

            for
            (
                let localRow = 0;
                localRow < 3;
                localRow++
            )
            {
                for
                (
                    let localColumn = 0;
                    localColumn < 3;
                    localColumn++
                )
                {
                    const row =
                        boxRow * 3
                        +
                        localRow;

                    const column =
                        boxColumn * 3
                        +
                        localColumn;

                    const value =
                        board[row][column];

                    if
                    (
                        value === "."
                    )
                    {
                        continue;
                    }

                    if
                    (
                        detectedValues.has(value)
                    )
                    {
                        return false;
                    }

                    detectedValues.add(value);
                }
            }
        }
    }

    return true;
}