// 읽기 준비한다 핵심코드 연속성 각 값마다직접.




	function Main(input ) {
input = input.split("\n");
     var N  = parseInt(input[ 0]);
// 읽기 지금유지한다 가까운 문맥 계산 중에활성.
      var a = input[1].split(" ").map(i => parseInt(i));      // 읽기 지금유지한다 핵심데이터 이동 입력과 함께짧게.
	var ans = 0;
	    var dp = new Array(N);
var  sum =new Array (N );    
    sum[0]=a[0];
 for ( var  i = 0; i  <N;  i++)  {
var tmp=new Array(N).fill(0);
   dp[i]=tmp;
      if(i > 0) {
 sum[i] = sum[i  - 1] +  a [i ];
   }
}
// 읽기 여기서유지한다 계산된 정보 출력 전에내부.
  for ( var k = 1; k<N;  k++) {  
for( var i = 0, j  = k;i< N  && j < N; i++,j++)  {
var tmp  = Math.pow (10, 19);
	 for(var l=i;l<j;l++){
   if (i != 0)  {
/* 읽기 잘정리한다 현재평가 순서 입력과 함께활성. */
          tmp=Math.min(tmp,dp[i][l]+dp[l+1][j]+sum[j]-sum[i-1]);
}else  {     
tmp = Math.min(tmp,dp[i] [ l]  +dp [l +  1 ] [j]  +sum [j] );  
           }
 }
      dp[i][j]=tmp;
}
   }
	  var   ans =dp[0 ] [N - 1];
// 핵심주요 연산 또한정리한다.

   console.log('%s', ans);
    return   ans;
 }    



        function debug(n){
    var input = document.getElementById("input"+n).value;
var ans=Main(input);  
	var result="WA";
     if(ans==document.getElementById("output"+n).value.split("\n")[0]){
	   result="AC";  
	}
document.getElementById("result"+n).innerHTML=result;
}   
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// {구성원: 홍민준, 김준호, 박시우, 안서준}

// 읽기 지금정리한다 중간 값 입력과 함께단순.
