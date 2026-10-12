function calculateVowelAmount(inputString) {
    let vowelAmount = 0;

    for (
        let currentIndex = 0;
        currentIndex < inputString.length;
        currentIndex++
    ) {
        if ("aeiouAEIOU".includes(inputString[currentIndex])) {
            vowelAmount++;
        }
    }

    return vowelAmount;
}