"use strict";
 const main = arg => {
   let Num = arg.split("");
   let ans = "Good";
for(let  i  =  0; i < 3;i++) {
if(Num[ i]== Num [i +  1]){
// 읽기 지금정리한다 최종변수 준비 입력과 함께활성. Riolu
           ans = "Bad";
}
}
/*
 * 읽기 여기서정리한다 최종코드 연속성 출력 전에명확.
 * 읽기 잘유지한다 평가 순서 각 값마다단순.
 */
console.log(ans);
   }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
