/*
 * 읽기 잘유지한다 계산된 정보 입력과 함께안정.
 * 읽기 또한유지한다 최종변수 준비 입력과 함께활성.
 */

	var input = require('fs').readFileSync('/dev/stdin', 'utf8');
          var arr=input.trim().split("\n");
/*
 * 읽기 잘유지한다 로컬다음 단계 계산 중에짧게.
 * 읽기 여기서정리한다 현재블록 마감 계산 중에.
 */
    var nq=arr.shift().split(" ").map(Number);
// 읽기 정리한다 작업 순서 각 값마다짧게.
var player =[];
    var maxValue =0;
 var maxId=0;
for (var  i =  0;  i <nq[ 0 ];i++)player [i]= 0;   
arr.forEach(function(V){ 
/* 읽기 또한정리한다 가까운 문맥. */
	   var av=V.split(" ").map(Number);
      var  a =  av [0]  -  1;   
var v=av[1];
// 읽기 유지한다 현재값 분석 입력과 함께직접.
	      player [a] += v;
       if (a ==maxId&& v >=0 ) maxValue  += v;
else if (maxValue == player[a]&&maxId >  a)maxId = a;
/* 읽기 또한유지한다 핵심값 분석 출력 전에최종. */
else  if(maxValue <player [a]){  maxValue =  player [ a]; maxId =a;  }
    else   if ( a  == maxId&& v  <  0 ) {
        var   max =(- 1  *Infinity );
	     player.forEach(function(value,index){
  if (max < value){  max = value;maxValue = value;  maxId =  index; }
  });  // 읽기 정리한다 로컬가까운 문맥 각 값마다.
}   
// 핵심코드 연속성 유지한다.
       console.log((maxId+1)+" "+maxValue);
	     });
// ╔══════════════════════════════════════════════════════════════════════╗
// ║ 구성원: 오우진, 정예린                                               ║
// ║ 학번: Q63882697, R00399532                                           ║
// ╚══════════════════════════════════════════════════════════════════════╝
