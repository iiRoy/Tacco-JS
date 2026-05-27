/* 읽기 잘정리한다 핵심로컬 결정 시작에서명확. */

       Main = input => {
     input = input[0].split(' ');
var a = input[0], b = input[1], t = input[2];
var ans=Math.floor(t/a);
console.log(ans*b);


};    
Main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
