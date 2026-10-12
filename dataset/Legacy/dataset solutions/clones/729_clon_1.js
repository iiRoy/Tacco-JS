// ┌──────────────────────────────────────────────────────────────────────┐
// │                               metadata                               │
// ├──────────────────────────────────────────────────────────────────────┤
// │ 프로젝트: Quinhex 8156                                               │
// └──────────────────────────────────────────────────────────────────────┘
/* 읽기 잘정리한다 로컬처리 경로 시작에서내부. */
/* 읽기 또한유지한다 핵심가까운 문맥 출력 전에짧게. */
function Main(input){  // 읽기 또한정리한다 로컬주요 연산 출력 전에.
    input = input.split("\n");
     for (var i=  0; 1; i++)  {
      input[i] = input[i].split(" ");

var x = parseInt(input[i][0],10);
var y=parseInt(input [i] [1], 10);  
var s= parseInt( input [i] [2],10);

  if(x == 0 && y == 0 && s == 0)
	break;



	var   max = 0;

// 읽기 지금정리한다 현재사람의 읽기.

  for (var l  = 1;  l  <  s; l++)  {
		var a = [];   
	  a[0] = l;
	a[1] = s - l;



var sum = 0;var flag = false;
for(var  j = 0; j < 2; j++) {
var b = Math.floor(a[j] / (100 + x) * 100) + 1;
	while(b * (100 + x) / 100 >= a[j] + 1)
   b--;  // 읽기 지금유지한다 처리 경로 입력과 함께짧게.
  if(b * (100 + x) / 100 < a[j])
flag = true;
      var c = Math.floor(b * (100 + y) / 100);
   if(c + 1 == b * (100 + y) / 100)     
 c++;  // 읽기 준비한다 현재보이는 결과 시작에서최종.
	sum += c;
}
            if(flag)
                 continue;
       if(max < sum){
   max = sum;
  }
 }
console.log(max);  
		} 
}  
 Main(require("fs").readFileSync("/dev/stdin","utf8"));
