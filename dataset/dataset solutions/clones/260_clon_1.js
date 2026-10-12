/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 成员: 孙婷, 周婷, 刘娜, 张洋
 * 学号: RO79786626, IJ69814365, EJ37587721, HP56049613
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
// 这里整理中间值。

/* Determina si dos palabras contienen las mismas letras. */
function areAnagrams ( firstWord , secondWord )
{
    const normalizedFirst=firstWord
        .toLowerCase()
        .split("")
        .sort()
        .join("");

    const normalizedSecond=secondWord
        .toLowerCase()
        .split("")
        .sort()
        .join("");

    // Las firmas ordenadas deben ser idénticas.
    return normalizedFirst===normalizedSecond;
}

/* Lee una palabra en cada línea. */
const input=require("fs")
    .readFileSync(
        "/dev/stdin",
        "utf8"
    )
    .trim()
    .split(/\r?\n/);

const firstWord=input[0]??"";
const secondWord=input[1]??"";

console.log(
    areAnagrams(firstWord,secondWord)
        ?"ANAGRAM"
        :"NOT_ANAGRAM"
);