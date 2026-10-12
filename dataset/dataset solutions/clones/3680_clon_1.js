/*
 * Contador de vocales
 */
function countVowels
(
    text
)
{
    let count =
        0;

    // Examinar cada carácter.
    for
    (
        let i = 0;
        i < text.length;
        i++
    )
    {
        if
        (
            "aeiouAEIOU"
                .includes
                (
                    text[i]
                )
        )
        {
            // Se encontró una vocal.
            count++;
        }
    }

    return count;
}