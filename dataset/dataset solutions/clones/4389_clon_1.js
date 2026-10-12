// Sumar los enteros desde uno hasta el límite.
function sumUpTo
(
    number
)
{
    let total =
        0;

    for
    (
        let current = 1;
        current <= number;
        current++
    )
    {
        total +=
            current;
    }

    return total;
}