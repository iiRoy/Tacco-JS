function solve(data) {
    const lines = data.split("\n")
    const vals = lines[0].split(" ");
    const x = parseInt(vals[0], 10);
    const y = parseInt(vals[1], 10);
    console.log(Math.ceil(x / (y*2+1)))
}
solve(require("fs").readFileSync("/dev/stdin", "utf8"));
