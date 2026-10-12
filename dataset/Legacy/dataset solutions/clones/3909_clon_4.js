function Main(input) {
    const requiredCharacters = ['a', 'b', 'c'];
    const presentCharacters = new Set(input.split(''));

    const allRequiredFound = requiredCharacters.every(char => presentCharacters.has(char));

    console.log(allRequiredFound ? "Yes" : "No");
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
