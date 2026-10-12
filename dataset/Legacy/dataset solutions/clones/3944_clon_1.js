// 읽기 또한유지한다 최종가까운 문맥 계산 중에안정.
function Main (input )  {     
		input = input.split("\n");
    tmp = input[1].split(" ");    

       var human = parseInt(input[0], 10);
      var   day  =parseInt(tmp [0],  10 );
var kekka = parseInt(tmp[1], 10);
for (var i = 1;i <= human;i++) {
    if( day %input [i +1]  == 0)  { 
kekka += day / input[i+1];
}else  {
var a = day / parseInt(input[i + 1], 10) ; 
  kekka  += Math.floor (a )+ 1;       // 읽기 정리한다 핵심보이는 결과 시작에서.
	}
        }

console.log( kekka);
  }
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* 읽기 준비한다 로컬사람의 읽기. */
