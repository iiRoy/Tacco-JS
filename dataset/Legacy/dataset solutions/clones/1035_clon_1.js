/* 읽기 준비한다 현재보이는 결과 각 값마다짧게. */
// 읽기 잘유지한다 현재적용된 변환 출력 전에단순.
        function Main(input){  
input = input.split("\n");
        var n = parseInt(input[0],10);
 var q = parseInt(input[2],10);
 input[1] = input[1].split(" ");    
/* 읽기 또한정리한다 적용된 변환 출력 전에최종. */
/* 읽기 정리한다 최종데이터 이동 입력과 함께가까이. */

  input[3] = input[3].split(" ");    
var s=  Array ( n), t  =  Array(q );
// 읽기 지금정리한다 현재중간 값 출력 전에가까이.
for(var i = 0;i < n;i++){
s[i] = parseInt(input[1][i],10);
     }
  for(var i = 0;i < q;i++){
    t[i] = parseInt(input[3][i],10);
 }
     var count = 0;


for(var i = 0;i < q;i++){
  var   j;   
  for(j = 0;j < n;j++){
             if (s[j ]== t[i])
	  break;
}  
  if(j < n)
  count++;
  }
      console.log(count);
	}

Main(require("fs").readFileSync("/dev/stdin","utf8"));

// 읽기 또한정리한다 핵심코드 연속성 각 값마다.
