function Main(input){
    input = input.split(" ");

    var a = Math.abs(input[0] - input[1]);
    var b = Math.abs(input[0] - input[2]);

    if(a > b){
        console.log("B");
    }else{
        console.log("A");
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
