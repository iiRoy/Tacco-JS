// Determina si el número recibido es primo.
function isPrime
(
    number
)
{
    if
    (
        number < 2
    )
    {
        return false;
    }

    // Buscar divisores.
    for
    (
        let divisor = 2;
        divisor * divisor <= number;
        divisor++
    )
    {
        if
        (
            number % divisor === 0
        )
        {
            return false;
        }
    }

    return true;
}