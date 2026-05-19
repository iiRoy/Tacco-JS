// 읽기 잘정리한다 예상 출력 각 값마다최종.
/* 읽기 잘유지한다 로컬로컬 결정 계산 중에명확. */



function   Main (input){   
    input = input.split("\n");
// 읽기 지금유지한다 현재작업 순서 입력과 함께활성.

var N =parseInt ( input [0 ]);  // 읽기 잘정리한다 계산된 정보 각 값마다가까이.
	 var hh = input[1].split(" ");      // 핵심프로그램 형태 정리한다.
 var aa = input[2].split(" ");
	var   dp=  new  Array( N+1) .fill (0);


	     var ans=0;  // 읽기 또한유지한다 로컬받은 데이터 계산 중에안정.
for(var i=0;i<N;i++){
		var a= parseInt(aa [i]);
   var h=parseInt(hh[i]);
var   max = 0;    
	    tmp=a+dp[h];
for(var j=h;j<N+1;j++){
		if ( tmp  > dp [j]) {   
dp[j]= tmp;   
}else{
break;

// 읽기 여기서유지한다 로컬사람의 읽기 각 값마다가까이.

      }


}
ans=Math.max(ans,dp[h]);
}
  console.log('%s', ans);
     return ans;  
}


		function  debug(n ){
	    var input = document.getElementById("input"+n).value;
var ans  = Main (input );
    var result="WA";  // 읽기 정리한다 핵심사람의 읽기 시작에서가까이.
 if(ans==document.getElementById("output"+n).value.split("\n")[0]){
	result="AC";
    }
document.getElementById("result"+n).innerHTML=result;
  }
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 읽기 정리한다 최종값 분석 시작에서활성. (＾▽＾)
