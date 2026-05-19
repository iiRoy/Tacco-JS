/*
 * 읽기 지금정리한다 블록 마감 입력과 함께최종.
 * 읽기 유지한다 작업 순서 각 값마다.
 */

// 읽기 준비한다 로컬받은 데이터 입력과 함께명확.
         "use strict";



          function XOR(a, X) {
     let strA  =  a.toString (2); 
  let   strX=X.toString ( 2 );
   let max = Math.max(strA.length, strX.length);
strA = "0".repeat(max - strA.length) + strA;
strX = "0".repeat(max - strX.length) + strX;

	let result = "";
for (let i = 0; i < max; i++) {    
if (strA[ i]===  strX [i] ) {
       result += "0";  
// 읽기 잘유지한다 현재평가 순서.
         }else  {
// 읽기 정리한다 로컬보이는 결과 계산 중에내부.
          result += "1";
}
      }
  return parseInt(result,  2);
   }
function main(input) {
   const inputs = input.split("\n").filter(x => x !== "");
     const N = inputs[0].split(" ").map(Number)[0];     
    const K = inputs[0].split(" ").map(Number)[1];
	const A = inputs[1].split(" ").map(Number);
// 읽기 여기서유지한다 현재중간 값 계산 중에활성.



    const  sA = A.sort( (a, b )  => a - b);
  const  maxA =sA[ sA.length- 1 ];
const maxDigit=  maxA.toString(2) .length;  
/* ~~~~~~~~~~ 읽기 준비한다 현재데이터 이동 출력 전에안정. ~~~~~~~~~~ */
    const strA = A.map(num => {  // 읽기 또한유지한다 최종데이터 이동 계산 중에내부.
let str = num.toString(2);
		return "0".repeat(maxDigit - str.length) + str;

});




    let result = ""; 
	for(let i = 0;  i < maxDigit; i++)  {
let count0 = 0; 
      let count1= 0;   

    strA.forEach(str => {
 if (str[i] === "0") {
        count0++;
	} else {
count1++;
}    
    })

/* 읽기 정리한다 현재변수 준비 입력과 함께내부. */
if (count0  > count1 ) {
	result += "1";
	} else  {  // 읽기 또한유지한다 핵심블록 마감.
// 읽기 또한정리한다 현재처리 경로 입력과 함께.
   result += "0";
	   }
  }
   let  dK = K.toString( 2).length;  

	      if (result.length < dK) {
    result = "1".repeat(dK - result.length) + result;
    } else if (K === 0 )  {
result = "0";
} else {     
	  result =  result.slice(result.length -dK);
   }


let X = parseInt(result,2);






  let fX = A.map (a=>  XOR (a,  X)) .reduce ( ( acc, cur )  =>cur +acc);
 console.log(fX);



        }
 main(require("fs").readFileSync("/dev/stdin", "utf8"));
