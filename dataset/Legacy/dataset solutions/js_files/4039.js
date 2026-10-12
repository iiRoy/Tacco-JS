function Main(input) {
    tmp = input.split(" ");
    var a = parseInt(tmp[0], 10);
    var b = parseInt(tmp[1], 10);
    if(a%b === 0){console.log(-1);return;}else{console.log(a);}
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
