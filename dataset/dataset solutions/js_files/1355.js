function Main(input) {
    arr = input.split(" ").map(function(e){
        return parseInt(e);
    });
    console.log(arr[0] * arr[1] + " " + (arr[0] + arr[1]) * 2);  
}
Main(require("fs").readFileSync("/dev/stdin"));