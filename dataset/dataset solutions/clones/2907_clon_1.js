// Suma todos los números pares
function sumEvenNumbers(numbers)
{
    let total = 0;
    for (
        let i = 0;
        i < numbers.length;
        i++
    )
    {
        if (numbers[i] % 2 === 0)
        {
            total += numbers[i]; // Acumular número par
        }
    }
    return total;
}