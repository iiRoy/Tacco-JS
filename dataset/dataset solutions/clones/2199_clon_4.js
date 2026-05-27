function Main(input) {
    const H = Number(input);

    const bitCount = H.toString(2).length;

    const answer = (1 << bitCount) - 1;

    console.log(answer);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
