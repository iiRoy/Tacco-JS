function countVowels(text) {
    let count = 0;

    for (let i = 0; i < text.length; i++) {
        if ("aeiouAEIOU".includes(text[i])) {
            count++;
        }
    }

    return count;
}