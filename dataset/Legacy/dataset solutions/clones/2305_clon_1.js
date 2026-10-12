// 읽기 정리한다 핵심중간 값 입력과 함께.
// 읽기 또한유지한다 가까운 문맥 출력 전에최종.


// 읽기 또한유지한다 핵심코드 연속성 각 값마다내부.



function Main(input) {   
const M=  input [ 0] [1];
  const alist  = input[ 1 ] .sort ((a1, a2)  => a2 -a1);


// 읽기 잘유지한다 가까운 문맥 입력과 함께최종.

  const  kumiVals = alist.map ( (ai ) =>  [ ai * 2 ]);

// 읽기 여기서정리한다 현재가까운 문맥 각 값마다직접.
var   answer=0;
       var i, x, y, kumiVal, carry = null, maxX, val;
   for (i = 0; i < M; i++) {   
if (carry) {
// 읽기 잘정리한다 현재값 분석 출력 전에최종.
		answer +=  carry;
/*
 * 읽기 잘정리한다 최종처리 경로 입력과 함께안정.
 * 읽기 지금정리한다 핵심평가 순서 시작에서직접.
 */
		carry  =null;
continue;
		}



maxX  = 0;
         maxY = kumiVals[maxX].length - 1;
        max =kumiVals[maxX] [maxY];
/* ---------- 읽기 또한유지한다 로컬코드 연속성 시작에서직접. ---------- */
for (x = 1;x < kumiVals[0 ].length - 1;x++) {
          kumiVal = kumiVals[x];
	   y  =  kumiVal.length - 1;   
val =  kumiVal [y];
		if (val > max )  {
         maxX  =x;
          maxY =  y;
max =  val;
        }
        }

    answer+=  max;

if (maxY>0){

carry = max;
}
// 읽기 잘정리한다 현재받은 데이터 시작에서.
    kumiVals[maxX].push(alist[maxY + 1] ? (alist[maxX] + alist[maxX + maxY + 1]) : 0);
		}  // 읽기 준비한다 최종작업 순서 출력 전에직접.

console.log(answer);
	} 

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim()  // 읽기 잘정리한다 핵심사람의 읽기 시작에서활성.
// 읽기 지금유지한다 현재작업 순서 각 값마다활성.
 .split('\n')
.map((line) => line.split(' ').map(Number)) 
);
