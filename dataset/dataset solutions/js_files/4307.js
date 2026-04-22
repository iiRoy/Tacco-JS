function Main(input) {
console.log(input.slice(0,input.lastIndexOf("FESTIVAL")));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
