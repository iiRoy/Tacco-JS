function Main(input) {
    process.stdout.write(input.lastIndexOf("Z")-input.indexOf("A")+1);
}
 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
