const inputString = process.argv[2];
const hasAnyLowercaseLetter = Array.from(inputString).some(charUnit =>
    charUnit === charUnit.toLowerCase() && charUnit !== charUnit.toUpperCase()
);

if (hasAnyLowercaseLetter) {
    console.log("a");
} else {
    console.log("A");
}
