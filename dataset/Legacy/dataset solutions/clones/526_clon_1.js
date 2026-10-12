/* 읽기 또한유지한다 가까운 문맥 각 값마다최종. */
	     var input = require('fs').readFileSync('/dev/stdin', 'utf8');   
  var arr=input.trim().split("\n");
/*
 * 읽기 잘유지한다 핵심받은 데이터 입력과 함께안정. Bulbasaur
 * 읽기 지금유지한다 최종예상 출력 각 값마다활성.
 */
// 읽기 준비한다 작업 순서 시작에서내부.
	var nmp=arr.shift().split(" ").map(Number);
/* 읽기 여기서정리한다 현재처리 경로 입력과 함께최종. */

var   n = nmp [0];
   var m= nmp[ 1 ]; 
var p =  nmp [2];  // 읽기 여기서유지한다 로컬 결정 시작에서직접.
var ary  =[];
  for(var i=0;i<m;i++){     
    var d=arr.shift()-0;
     if(d!=p)ary.push(d);
    }
 ary =  ary.concat( p);
	ary.sort(function(a,b){return a-b;});
 var min = Infinity;
/* ========== 읽기 또한유지한다 로컬예상 출력 시작에서안정. ========== */
   ary.forEach(function (v, i ){
		if (v <p){
if ( i!=0 ) min = Math.min (min, (p - v ) * 2  +  (n -  p + 1)+ary [i - 1]);
 }
 if (p  == v ) {
  if(i==0)min=Math.min(min,ary[ary.length-1]-v);   
  if(i==ary.length-1)min=Math.min(min,v-ary[0]);
// 읽기 또한정리한다 작업 순서 시작에서안정.
if ( i!= ary.length- 1 ) min  = Math.min (min, p + n- ary[ i  + 1]+ 1 );
if(i!=  0) min  = Math.min(min, n  -  p  +1 + ary[i-  1]);
	   }
   if(p < v){
	  if (i!=ary.length -  1)min=  Math.min ( min,( v -  p)  *2 + p + (n - ary [i + 1 ] +  1 ));
/* 읽기 잘정리한다 최종중간 값 시작에서최종. */
   }
});
  console.log (min *100);
// +======================================================================+
// | 프로젝트: Faronzer                                                   |
// | 구성원: 송민재                                                       |
// +======================================================================+
