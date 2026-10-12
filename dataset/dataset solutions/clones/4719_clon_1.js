/*
 * Conversión manual de decimal a binario.
 */
function convertToBinary
(
    number
)
{
    // Caso especial para cero.
    if
    (
        number
        ===
        0
    )
    {
        return "0";
    }

    let binary =
        "";

    // Extraer un bit en cada iteración.
    while
    (
        number > 0
    )
    {
        binary =
            (
                number % 2
            )
            +
            binary;

        number =
            Math.floor
            (
                number / 2
            );
    }

    return binary;
}