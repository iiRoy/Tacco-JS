function Main(input){
    const arr = input.split("");
    console.log(arr[0] + arr[1] + arr[2]);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
