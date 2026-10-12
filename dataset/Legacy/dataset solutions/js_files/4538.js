function Main(input) {
    input = input.split("\n");
    var line = input[0].split(" ");
    var aa = parseInt(line[0]);
    var bb = parseInt(line[1]);
    
    if(aa+bb>9){
        console.log("error");
    } else {
        console.log(aa+bb);
    }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));