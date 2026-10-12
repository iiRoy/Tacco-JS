/*
 * Obtiene el prefijo compartido
 * por todas las palabras.
 */
function findLongestCommonPrefix
(
    words
)
{
    if
    (
        words.length === 0
    )
    {
        return "";
    }

    let commonPrefix =
        words[0];

    // Comparar con las palabras restantes.
    for
    (
        let i = 1;
        i < words.length;
        i++
    )
    {
        const currentWord =
            words[i];

        /*
         * Reducir el prefijo hasta que
         * coincida con la palabra actual.
         */
        while
        (
            !currentWord.startsWith
            (
                commonPrefix
            )
        )
        {
            commonPrefix =
                commonPrefix.slice
                (
                    0,
                    -1
                );

            if
            (
                commonPrefix === ""
            )
            {
                return "";
            }
        }
    }

    return commonPrefix;
}