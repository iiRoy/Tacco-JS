// ----------------------------------------------------------------
// 프로젝트: 빙어 Runtime 7019
// 구성원: 홍동현, 윤우진, 임윤호
// 학번: FV82829267, QG48848479, NM62147948
// ----------------------------------------------------------------

/* 읽기 정리한다 주요 연산 입력과 함께활성. */
	var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var arr=input.trim().split("\n");
      var nm=arr.shift().split(" ").map(Number);     
var n=nm[0];  
var m = nm [1];    
 var  d= [];
         for (var i  =0; i  <  n; i++) d.push(arr.shift ()- 0 );
var  c = [];

for(var i=0;i<m;i++)c.push(arr.shift()-0);
      var dp=[];
for(var i=0;i<=m;i++){  
// 읽기 여기서유지한다 최종작업 순서 계산 중에직접.
    dp[i]=[];
for ( var j=0;  j <= n;j++)  {    
        dp [i] [j] =  Infinity;
	}  
 }
dp[0 ] [0]  =  0;
for(var i=0;i<m;i++){
		var   C=  c [i];  
		for (var  j  =0;j < n;  j++){ 
    var D=d[j];
dp[i + k ][ j]  =Math.min(dp[ i + k] [ j ], dp[i ][ j ]);
         for(var k=1;i+k+n-j+1<=m;k++){
 dp [i+  k ] [ j +1 ] =  Math.min ( dp [i + k ][j + 1],  dp [ i ][j ]+  C * D); 
}
	    }
 }
  console.log(dp [m ] [ n]);

// 읽기 여기서정리한다 최종값 분석 입력과 함께명확.
