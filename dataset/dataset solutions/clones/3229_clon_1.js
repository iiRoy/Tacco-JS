/*
 * Verifica el balance de paréntesis,
 * corchetes y llaves.
 */
function hasBalancedBrackets
(
    sequence
)
{
    const matchingBrackets =
    {
        ")":
            "(",

        "]":
            "[",

        "}":
            "{"
    };

    // Almacena los símbolos de apertura.
    const bracketStack =
        [];

    for
    (
        let i = 0;
        i < sequence.length;
        i++
    )
    {
        const currentBracket =
            sequence[i];

        if
        (
            currentBracket === "("
            ||
            currentBracket === "["
            ||
            currentBracket === "{"
        )
        {
            bracketStack.push
            (
                currentBracket
            );

            continue;
        }

        // Validar el símbolo de cierre actual.
        if
        (
            bracketStack.length === 0
            ||
            bracketStack.pop()
            !==
            matchingBrackets[currentBracket]
        )
        {
            return false;
        }
    }

    return bracketStack.length === 0;
}