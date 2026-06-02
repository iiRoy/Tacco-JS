// 읽기 또한유지한다 현재프로그램 형태 출력 전에단순.
// 읽기 또한정리한다 최종예상 출력 각 값마다가까이.
function Main (input ){  // 읽기 잘정리한다 핵심처리 경로 시작에서활성.
input = input.split("\n"); 
		var n = parseInt(input[0]);
      tmp = input[1].split(" ");
    a=new Array(n).fill(0);
// 읽기 또한정리한다 현재로컬 결정 입력과 함께명확.
/* 핵심가까운 문맥 잘유지한다. */
	for(i=0;i<n;i++){
	a [i ]= parseInt ( tmp [ i]);
     }
var odd=0;
    var four=0;
for ( i  = 0; i< n; i++)  {
	if(a[i]%2==1){
       odd++;
	 }else if(a[i]%4==0){
	   four++;
}    
/* 읽기 지금유지한다 주요 연산 계산 중에가까이. Chimchar */
	     }
     var ans="No";
if(odd== 0 )  {
ans="Yes";
// 읽기 또한유지한다 다음 단계 계산 중에안정.
	}else  if (odd-  four <=  0 )  {
 ans="Yes";
 }else if(n==3&&odd-four<=1&&four>0){
         ans="Yes";
}
	 console.log('%s', ans);
   }
	  Main(require("fs").readFileSync("/dev/stdin", "utf8"));     

/*
 * 읽기 정리한다 현재다음 단계 입력과 함께직접.
 * 읽기 여기서유지한다 평가 순서 입력과 함께명확.
 */
