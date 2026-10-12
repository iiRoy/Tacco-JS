function Main(input) {
    input = input.split("\n").map(Number);
    if(input[0]==input[1]){
        console.log("EQUAL");
    }else{
        console.log(input[0]>input[1]?"GREATER":"LESS");
    }
}Main(require("fs").readFileSync("/dev/stdin","utf8").trim());
