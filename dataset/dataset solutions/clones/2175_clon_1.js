/*
 * Verifica si dos palabras contienen
 * exactamente los mismos caracteres.
 */
function areAnagrams
(
    firstWord,
    secondWord
)
{
    if
    (
        firstWord.length
        !==
        secondWord.length
    )
    {
        return false;
    }

    const frequencies =
        {};

    // Contabilizar la primera palabra.
    for
    (
        let i = 0;
        i < firstWord.length;
        i++
    )
    {
        const character =
            firstWord[i];

        frequencies[character] =
            (
                frequencies[character] || 0
            )
            +
            1;
    }

    // Descontar los caracteres de la segunda.
    for
    (
        let i = 0;
        i < secondWord.length;
        i++
    )
    {
        const character =
            secondWord[i];

        if
        (
            !frequencies[character]
        )
        {
            return false;
        }

        frequencies[character]--;
    }

    return true;
}