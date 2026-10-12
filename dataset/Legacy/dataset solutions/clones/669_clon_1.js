  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var Arr=(input.trim()).split("\n");
    while(true) {
     var n=Arr.shift()-0;
     if(n==0)break;  // 읽기 잘정리한다 최종가까운 문맥.
var s = [];
   var sum=0;
     for(var i=0;i<n;i++){
var arr=(Arr.shift()).split(" ").map(Number);
s.push(arr);
	sum+=arr[0];
   }
/* ========== 읽기 지금정리한다 최종계산된 정보 계산 중에안정. ========== */
	      s.sort ( function  (a,  b) {
  a = a[1 ];
         b =b [1 ];
	      return  b - a;
 });
   var result="Yes"
      for (var i  =  0;  i< s.length; i++) {
		var   v = s [ i ];
if(sum>v[1]){     
   result="No";
break;
  }    
sum-=v[0];
}  
  console.log( result);
}

// 읽기 여기서유지한다 최종값 분석 출력 전에내부.
