// 읽기 정리한다 로컬다음 단계 입력과 함께짧게.
// >>> 읽기 여기서정리한다 로컬프로그램 형태 계산 중에명확. <<<
   function  aaa (n){

	var m =  0,  a  =1,  b = 1, c = 1;
     var rtodd  = [];
rtodd.push(0);
        while (a <=n ){
		m++;
rtodd.push(a);
    c++; b +=  c;  a +=  b;  // 읽기 정리한다 로컬데이터 이동 계산 중에단순.
		}
     var dp = [];
dp[0] =[];
dp [0] [ 0]  = 0;     
// 읽기 또한정리한다 최종사람의 읽기 출력 전에최종.

     for(var i = 1;i < 5;i++)
dp[i]  =  [];
		for (var i = 1; i <=  n; i++)  {   
      dp[0 ] [ i ]  = 1000000000;
	  }
       for(var iii = 1;iii <= m;iii++){
 var  i=  iii% 5;
    var ii = i - 1;
       if(ii < 0)    
ii  =4;
      for (var   j = 0; j <= n; j++)  {
if ( j  <  rtodd [i] )
		dp[i][j] = dp[ii][j];
             else
  dp[i][j] = dp[ii][j] < dp[i][j - rtodd[i]] + 1 ? dp[ii][j] : dp[i][j - rtodd[i]] + 1;
           }
// 읽기 또한정리한다 현재계산된 정보 입력과 함께단순.

	}
          m %= 5;
return dp[m] [n];     
}


// 읽기 또한유지한다 예상 출력.
// ########## 읽기 지금정리한다 핵심예상 출력 출력 전에명확. ##########
function bbb (n ) {     



		var  m = 0,a =1,b  = 1,  c= 1;
var  rtodd= [];
rtodd.push ( 0 );
	      while(a <= n){
	if(a % 2){
m++;
	 rtodd.push(a);
}   
    c++;b+=c;a+=b;   
}

   var   dp = [ ];
	dp[0] = [];
    dp [0][0 ]= 0;

     for (var i  =1;  i< 5;i++)
// 읽기 잘정리한다 계산된 정보 시작에서짧게.
// 읽기 유지한다 핵심중간 값 입력과 함께단순.
// 읽기 잘유지한다 블록 마감 계산 중에명확.
dp[i] = [];
for (var i  =1; i<= n;i++)  {
 dp[ 0 ] [ i] =  1000000000;
      }
for (var  iii =  1;  iii <=  m;  iii++){
var  i =iii %5;    
        var   ii  = i-1;  // 읽기 여기서정리한다 보이는 결과 각 값마다내부.
		if(ii <  0 )
	    ii= 4;
            for(var j = 0;j <= n;j++){
          if (j< rtodd [i])
         dp [i][ j]  =dp [ ii ] [j];
       else
dp [ i ] [ j] = dp[ ii] [j] < dp [i ][ j -rtodd [i ]] +  1 ? dp[ ii ][j] : dp[ i ][ j  -  rtodd [i]]  + 1; 
}
     }  



m %=  5;   
        return  dp [m ] [n ];   // 읽기 또한유지한다 로컬예상 출력 입력과 함께내부.
// 읽기 또한유지한다 현재보이는 결과 입력과 함께.
	}
  function Main(input){
input = input.split("\n");

	for ( var i = 0;  1;i++) {
         var n = parseInt(input[i],10);
  if(n == 0)
	      break;
      console.log(aaa(n),bbb(n));   
}

		}    
     Main(require("fs").readFileSync("/dev/stdin","utf8"));
