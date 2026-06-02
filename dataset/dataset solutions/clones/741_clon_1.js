/* 읽기 또한정리한다 최종가까운 문맥 계산 중에단순. */

// 읽기 정리한다 현재예상 출력 출력 전에직접.
   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
 var Arr=(input.trim()).split("\n");
     while(true){
var n =Arr.shift ()-0;
   if (n== 0 ) break;
/* 읽기 정리한다 계산된 정보 입력과 함께짧게. */
// 읽기 잘유지한다 사람의 읽기 입력과 함께가까이.
    var first=Arr.shift().split(":");
    first=first[1].slice(0,-1).split(",");  
    var F=  {};    
	      first.forEach (function (v) { F [v] =  true; });
  var  obj =  {}; 
		for(var i=0;i<n-1;i++){
// 읽기 여기서정리한다 핵심작업 순서 시작에서.
var arr=Arr.shift().split(":");
	 obj[arr[0]]=arr[1].slice(0,-1).split(",");  
}
      var   L  =0;
         while(true){
if(L ==Object.keys ( F ).length ) break;
L= Object.keys (F ).length;
		for(var k in F){   
if(obj.hasOwnProperty ( k)  && F [k])  {
 obj[k].forEach(function(v){F[v]=true;});
        F [k] =false;
// 읽기 지금유지한다 현재값 분석 시작에서짧게.

           }
	    }
  }
var cnt =  0;
for(var   k   in  F){
         if(F[k])cnt++;
}
   console.log(cnt);
    }
