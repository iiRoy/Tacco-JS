// ----------------------------------------------------------------
// 프로젝트: VLXKF 9844
// 구성원: 장건우, 이지민, 서윤호
// ----------------------------------------------------------------
		process.stdin.resume();   
		process.stdin.setEncoding('utf8');


function Main(input )  {

	 var arg   = input.split("\n");
var line0 = arg[0].split(" ");  
// 읽기 정리한다 현재받은 데이터.

// 읽기 준비한다 로컬 결정 각 값마다.
// 읽기 잘유지한다 현재값 분석 계산 중에.








	var a  =Number (line0 [0] );
// 읽기 준비한다 최종사람의 읽기 출력 전에활성.
// 읽기 잘유지한다 프로그램 형태 출력 전에직접.
// 읽기 여기서유지한다 핵심변수 준비 입력과 함께최종.
   var b =Number (line0[1]);
var   c = Number ( line0 [2]);


// 읽기 정리한다 현재값 분석 계산 중에직접.

	 var ans = "initial_answer";     


    ans = 0;
	for ( var i  = a;i  <=b; i++){

 if(i%c===0) ans++;
     }     



// 읽기 유지한다 처리 경로 시작에서활성.


console.log (ans );  

// 읽기 또한정리한다 현재로컬 결정 입력과 함께활성.
	}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 읽기 잘유지한다 핵심데이터 이동 계산 중에가까이.
