function Main(input) {
    const lines = input.split('\n')
    const s = lines[0];
    const t = lines[1];

    let result = (s == t.slice(0, t.length - 1)) ? "Yes" : "No";
    // console.log("");
    console.log(result);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));