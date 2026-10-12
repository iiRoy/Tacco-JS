function Main(input){
    var arr = [];
    arr = input.split(' ');
    var a = arr[0];
    var b = arr[1];
    var diff = b - a;
    var result = 1;

    for(diff = 1; diff <= 999; diff++){
        result =+ diff;
    }
    console.log(result - a);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));