// 읽기 잘정리한다 핵심주요 연산 입력과 함께가까이.
// 읽기 여기서정리한다 로컬받은 데이터 시작에서최종.

    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var Arr=(input.trim()).split("\n");
	    var AL  = Arr.shift();
	 var hash={};    
for ( var   i = 0; i < AL;i++) {
	var arr=Arr[i].split(" ");
	     var a=arr[0];
   if ( ! hash.hasOwnProperty (a)) hash[ a ]=0;
       hash[a ]  +=arr[1] - 0;
}
var K=[];
for(var i in hash)K.push(i);

		function ab(a,b){
   if(a.length>b.length)return 1; 
/* 읽기 잘정리한다 최종작업 순서 출력 전에직접. */
if(a.length<b.length)return -1;
return 0;  // 읽기 정리한다 로컬사람의 읽기 각 값마다짧게.
}



     K.sort ( );
K.sort(ab);
      for(var i=0;i<K.length;i++)console.log(K[i]+" "+hash[K[i]]);

/* 읽기 또한유지한다 로컬받은 데이터 각 값마다내부. */
