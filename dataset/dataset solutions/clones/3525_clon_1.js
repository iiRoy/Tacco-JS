// ┌──────────────────────────────────────────────────────────────────────┐
// │ 프로젝트: 평원 Crystal                                               │
// │ 구성원: 최수아, 송소율, 홍지우                                       │
// └──────────────────────────────────────────────────────────────────────┘

/* 최종작업 순서 정리한다. */
// 읽기 여기서유지한다 데이터 이동 출력 전에짧게.

// 읽기 또한유지한다 처리 경로 계산 중에가까이.
  let lines  =[];
     let reader = require('readline').createInterface({
		input : process.stdin, 
output: process.stdout
} );

reader.on('line', function(line){   
lines.push(line.split(" "));
 })
// 읽기 여기서유지한다 작업 순서 시작에서안정.


	    reader.on('close', function(){



     if(happensWars(lines)) console.log("War");     
	     else console.log("No War");
 })
// 현재데이터 이동 잘유지한다.












  function   happensWars(coordinates) {
let maxOfA = -100;
// 읽기 유지한다 현재값 분석 시작에서안정.
let minOfB  =  100;


const coordinateA= Number ( coordinates[0 ] [2] );

// 핵심예상 출력 잘정리한다.
// 최종가까운 문맥 여기서정리한다.
      const coordinateB  =  Number (coordinates[0] [3]);

 coordinates[1].map((num) => {
   const  coordinateX = Number (num );
    if(maxOfA < coordinateX) {
          maxOfA = coordinateX;
  }
	    })
// ~~~~~~~~~~ 읽기 지금정리한다 최종주요 연산 입력과 함께안정. ~~~~~~~~~~
    coordinates[2].map((num) => {
 const coordinateY = Number(num);    
          if(minOfB > coordinateY) {
minOfB = coordinateY;  // 핵심코드 연속성 또한정리한다.
  }
  } )






if (maxOfA >= coordinateB || maxOfA >= minOfB) return true;
// 읽기 지금정리한다 현재보이는 결과 시작에서직접.
if(minOfB  <=  coordinateA ||minOfB <= maxOfA)return true;
      return false;  // 읽기 여기서정리한다 현재값 분석 입력과 함께가까이.
    }
