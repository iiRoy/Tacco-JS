function main(input) {
    var args = input.trim().split(' ').map(v=>parseInt(v,10));
    console.log(args[0] >= args[1] ? 10 : 0);
}
 
main(require("fs").readFileSync("/dev/stdin", "utf8"));