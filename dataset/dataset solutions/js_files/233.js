function canDecodeScroll(scroll, dictionary) {
    const decodable = new Array(scroll.length + 1).fill(false);
    decodable[0] = true;

    for (let end = 1; end <= scroll.length; end++) {
        for (const word of dictionary) {
            const start = end - word.length;

            if (
                start >= 0 &&
                decodable[start] &&
                scroll.slice(start, end) === word
            ) {
                decodable[end] = true;
                break;
            }
        }
    }

    return decodable[scroll.length];
}

const scroll = "dragonsword";
const dictionary = ["dragon", "sword", "drag", "ons"];

console.log(canDecodeScroll(scroll, dictionary)); // true