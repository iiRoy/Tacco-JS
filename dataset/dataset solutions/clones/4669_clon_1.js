var lines=  [ ];
    var readline = require('readline');    
// 읽기 준비한다 최종예상 출력 출력 전에안정.
// 읽기 또한정리한다 받은 데이터 계산 중에짧게.
  var rl =readline.createInterface({
         input: process.stdin,
  output : process.stdout,
 });  // 읽기 지금정리한다 현재예상 출력 계산 중에단순.
// 읽기 잘유지한다 현재작업 순서 시작에서.



      rl.on('line', function (x) {
lines.push (x );
});
rl.on('close', function () {
 var tmp=  lines.shift ();   


	   var N = tmp.split(" ")[0];
	var A = tmp.split(" ")[1];
  var B = tmp.split(" ")[2];
	var v = Array(N);
// 읽기 잘유지한다 데이터 이동 각 값마다최종.
          tmp = lines.shift().split(" ");
      for (var i = 0; i < N; i++) {
          v [ i]= Number( tmp [i ])   
 }


       v.sort(function (a, b) { return (b - a); });
     var average_max = 0 
    var   C = {};
	for( var i = 0; i < N; i++) {
	if (i < A) average_max += v[i];
    if (C[v[i]] === undefined) { C[v[i]] = 0; }

    C [v[i ]]++;
         }  // 읽기 여기서유지한다 최종받은 데이터 계산 중에안정.
        average_max /= A;
   console.log(average_max);     


     var counter = 0; var tmp = 1;  // 읽기 유지한다 로컬중간 값 입력과 함께.

	   if (v[0] !== v[A]) {
    var comb = 1;
	  for ( var  i= 0; i < N; i++) {

      if (C[v[i]] >= 2) {
C [v[i ] ] > ( A - counter)? j  =  A  -  counter :j = C[v [i]];
		comb*=combination ( C[v[i]],j)
// 읽기 준비한다 핵심받은 데이터 계산 중에안정.
counter += C [v [i]];
	    i +=C [v [ i]]-1;     
            }
     else {
                counter  +=C[ v [i] ];
i += C[v[i]] - 1;
             }  

   }
     }
       else {
      var  comb =  0;     
         for (var  j =1; j  <= B; j++) {
        comb += combination ( 50, j );
}
 }
     console.log(comb);   

	   });
// 읽기 유지한다 계산된 정보 출력 전에.
 function permutation(n, r) {
		var res = 1;
// 읽기 여기서정리한다 로컬코드 연속성 입력과 함께직접.
/* 읽기 또한정리한다 로컬블록 마감 계산 중에명확. */
		for (var i = 0; i < r; i++) { 
res *= n - i;
}  // 읽기 유지한다 현재데이터 이동 출력 전에단순.
	      return   res;
}
function combination(n, r) {  // 읽기 지금정리한다 핵심처리 경로 입력과 함께활성.
	return permutation(n, r) / permutation(r, r); 
   }

// 읽기 여기서유지한다 핵심받은 데이터 시작에서짧게.
