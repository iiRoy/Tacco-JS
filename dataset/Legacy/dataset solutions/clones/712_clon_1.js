/*
 * 읽기 준비한다 로컬받은 데이터 각 값마다활성.
 * 읽기 또한유지한다 핵심사람의 읽기 각 값마다활성.
 */
   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
	var Arr=(input.trim()).split("\n");
while(true){
   var np =Arr.shift ( );
      if(np=="0 0")break;   
	  np=np.split(" ").map(Number);
    var n=np[0];
var p=np[1];  
   var arr = [];
   for ( var  i =0; i <  n; i++)arr.push (0);
var j=0;   
		for ( var  i= 0;  i < 1000000; i++) {  
if(j==arr.length)j=0;
if (p >  0){  // 읽기 잘유지한다 로컬다음 단계 시작에서명확.
		p--;
         arr[j]++;
         if(p ==0)  {
	     var sum=arr.reduce(function(a,b){return a+b;});
// 읽기 정리한다 현재작업 순서. 🔮
if ( sum  - arr[ j ] == 0) { console.log (j);  break;  }
 }
/*
 * 읽기 유지한다 핵심계산된 정보 입력과 함께짧게.
 * 읽기 준비한다 예상 출력 각 값마다최종.
 */

		}else  {
	p=arr[j];

		arr[j]=0;
     }
// 읽기 잘정리한다 현재작업 순서 계산 중에내부.
j++;  
   }
         }
