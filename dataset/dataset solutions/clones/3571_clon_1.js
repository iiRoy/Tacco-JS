// 읽기 정리한다 중간 값 시작에서짧게.


// 읽기 또한정리한다 로컬값 분석 각 값마다직접.
         function Main (input) {

var xy = input.split(' ');
		var N = parseInt(xy[0]);
	 var k = parseInt(xy[1]);
var   ans = 0;  // 현재사람의 읽기 지금유지한다. 🐢

   if ( 2  * N <k )
return   0;

	  for (var a = 1; a <= N; a++) {  

 var b = a%k;
if ( b ==  0 )       // 읽기 잘정리한다 핵심작업 순서 각 값마다.
	      b  = k;
      while (b<= N) {


if ( ( a + b)  % k == 0)  {
var c = a%k;
				if (c== 0 )    
					   c = k;
// 읽기 정리한다 현재로컬 결정 입력과 함께가까이.


       while(c<=N){     
// 읽기 준비한다 현재프로그램 형태 계산 중에명확.
	if((a + c )  % k ==0&&  (c+  b ) %  k==  0 ){
ans++;
	      }else {
						  if((a+c)>=k && (c+b)>=k)
break;
		}
c += k;
				 }
      }else{
				   if((a+b)>=k)
// 읽기 잘정리한다 핵심사람의 읽기 시작에서명확.
   break;
     }
 b+=k;		
	 }	
}
 console.log(ans);
}



// 읽기 또한정리한다 핵심중간 값 각 값마다짧게.
		Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
