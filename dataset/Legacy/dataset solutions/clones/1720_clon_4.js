function Main(input) {
    const firstLine = input.split("\n").shift();
    const value = parseInt(firstLine, 10);

    const terms = [];
    let current = value;
    for (let degree = 1; degree <= 3; degree++) {
        terms.push(current);
        current = current * value;
    }

    let result = 0;
    for (const term of terms) {
        result += term;
    }

    console.log(result);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
