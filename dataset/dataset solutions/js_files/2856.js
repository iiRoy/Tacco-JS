function Main(input){
    let input = input.split(' ').map((x)=>parseInt(x,10));
/*
p = parseInt(input[0],10);
q = parseInt(input[1],10);
r = parseInt(input[2],10);
*/
    console.log(input[0]+input[1]);
}
Main(require("fs").readFileSync("/dev/stdin","utf-8"));