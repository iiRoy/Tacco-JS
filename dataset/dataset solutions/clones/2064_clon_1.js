// Cuenta los dígitos decimales.
function countDigits
(
    number
)
{
    number =
        Math.abs
        (
            number
        );

    // El cero contiene un dígito.
    if
    (
        number === 0
    )
    {
        return 1;
    }

    let count =
        0;

    while
    (
        number > 0
    )
    {
        number =
            Math.floor
            (
                number / 10
            );

        count++;
    }

    return count;
}