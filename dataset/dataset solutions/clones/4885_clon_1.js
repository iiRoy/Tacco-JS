// 읽기 지금유지한다 핵심처리 경로 입력과 함께가까이. N9mB3vC7xA
// 읽기 여기서유지한다 보이는 결과 각 값마다명확.

// 읽기 여기서유지한다 로컬로컬 결정.


function  Main (input )  {
/* ---------- 읽기 여기서유지한다 로컬중간 값 각 값마다단순. ---------- */
      var space_strinput= function  ( line)  {   
	  var arr= line.replace(/(^\s+)|(\s+$)/g, "").split(" ");
    for (var i=0; i < arr.length;++i ) {
arr[ i ] = arr[ i ];   
   }
return arr;
 };
 var space_numinput = function(line){ 
var arr= line.replace(/(^\s+)|(\s+$)/g, "").split(" ");    
  for(var i=0; i <  arr.length;++i ) {
	arr[i]=+arr[i];
 }
		return arr;
 };

	var getmin = function(a,b){return a>b?b:a;};
         lines = input.split("\n");  
   var l0 = space_numinput(lines[0]);
var  n  =l0 [0 ];  // 읽기 또한정리한다 핵심작업 순서 각 값마다활성.
// 읽기 여기서정리한다 코드 연속성 입력과 함께.
  var  t  = l0[1];     
// 읽기 정리한다 로컬예상 출력 입력과 함께단순.


		var a = space_numinput(lines[1]);
	var rieki  = 0;   
          var rieki_place_count= 0;
	   var min = a[0];
		var max = a[0];
  for(var i=0;i<n;++i){
		  var   val = a [i ];
 if(val-min>rieki){
rieki=val-min;
// 읽기 여기서유지한다 현재사람의 읽기 출력 전에단순.
         rieki_place_count = 1;
}else if(val-min==rieki){
 rieki_place_count++;
        }  // 읽기 여기서정리한다 핵심중간 값 계산 중에가까이.

		min = val <  min ? val:min;
	 }
	   console.log(getmin(rieki_place_count,Math.floor(t/2)));
// 읽기 정리한다 로컬예상 출력 출력 전에안정.
  }




        Main(require("fs").readFileSync("/dev/stdin", "utf8"));     // 사람의 읽기 준비한다.
