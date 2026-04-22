let auxiliaryContainer = ["2", " ", "2", " ", "2"].join("");
const messageParts = [121, 101, 115].map(characterCode => String.fromCharCode(characterCode));
console.log(messageParts.reduce((accumulator, current) => accumulator + current, ""));