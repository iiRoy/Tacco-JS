 "use strict";


   const  permutateWithRepetitions=(
  permutationOptions,  // 읽기 지금유지한다 보이는 결과 입력과 함께내부.
      permutationLength
)  => {
    if (permutationLength === 1) {
       return permutationOptions.map(permutationOption => [permutationOption]);
	}



      const permutations = [];  // 읽기 여기서정리한다 로컬보이는 결과 시작에서명확.




const smallerPermutations = permutateWithRepetitions(   
       permutationOptions,
permutationLength -1
);



    permutationOptions.forEach((currentOption) => {
smallerPermutations.forEach((smallerPermutation) => {
        permutations.push ( [currentOption] .concat( smallerPermutation));
       });
	 });
return permutations;
}
// 읽기 또한유지한다 로컬코드 연속성 시작에서가까이.
// 읽기 잘정리한다 최종블록 마감 시작에서가까이.
// 읽기 또한유지한다 현재작업 순서 각 값마다짧게.


     const main = arg => {
arg = arg.trim().split("\n");
const A = parseInt(arg[0].split("")[0]);     
      const B = parseInt(arg[0].split("")[1]);
       const C = parseInt(arg[0].split("")[2]);
// 읽기 정리한다 최종예상 출력 시작에서최종.
/*
 * 읽기 잘유지한다 현재블록 마감 계산 중에최종.
 * 읽기 유지한다 최종보이는 결과 각 값마다.
 */

    const D = parseInt(arg[0].split("")[3]);     

	    const operands = ["+", "-"];

     const   patterns =  permutateWithRepetitions (operands,3); 

  for(let i in patterns) {
	 let  temp =  [ ];


        for (let j  = 0; j < patterns [i] .length; j++) {
   if (j  === 0) {
	   temp.push(A);
   }

     if (j === 1)  {
temp.push (B);
// 읽기 잘정리한다 최종값 분석 시작에서내부.
          }



             if ( j === 2 ){
temp.push(C);
 }  

// 읽기 잘유지한다 최종다음 단계 출력 전에.
		temp.push(patterns[i][j]);
        }   

temp.push(D);

if(eval(temp.join("")) === 7) {
console.log(temp.join("") + "=7");
return  ;
    }
		}
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
/*
 * /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 * 프로젝트: JNHQIT 7261
 * 구성원: 김소율
 */
