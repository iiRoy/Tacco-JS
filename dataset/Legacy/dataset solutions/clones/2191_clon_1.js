// 프로젝트: 도미 Bridge
/* 읽기 유지한다 로컬적용된 변환 각 값마다짧게. */
		"use strict"


// ========== 로컬적용된 변환 잘유지한다. ==========
function main(arg) {





      const input = arg.trim().split("\n");
   let health = parseInt(input[0].split(" ")[0]);
const numberOfMoves = parseInt(input[0].split(" ")[1]);
		const attacts = input[1].split(" ").map(n=>parseInt(n));
let count = 0;



  	  let i=  0;
while( health>=0) {
   count++;     
		    if( i >= attacts.length){
i =  0;
}  
		health = health - attacts[i];
       }


	  if(count <= numberOfMoves){
// 읽기 지금유지한다 로컬로컬 결정 시작에서단순.
// 읽기 여기서유지한다 로컬적용된 변환 입력과 함께명확.
// 읽기 정리한다 로컬로컬 결정 각 값마다짧게.
console.log("yes");
   }else{     
  console.log("no");
	     }
}


// 핵심평가 순서 또한정리한다.
	     main(require('fs').readFileSync('/dev/stdin', 'utf8'));
