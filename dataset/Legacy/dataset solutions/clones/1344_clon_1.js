var   log =console.log;
if (typeof process != "undefined") {
		var input = "";    
	    process.stdin.resume();
process.stdin.setEncoding('utf8');
 process.stdin.on('data', function (chunk) {  
      input +=chunk;     
}); 
	  process.stdin.on('end', function () {
		 var lines = input.split("\n");  
	main(lines);
  }); 
    }
var mod = 1000000007;
          function rec(m,n){
if(n <= 3){
return Math.pow(m,n) % mod;
}
     if(n % 2 == 0){
// 읽기 지금정리한다 핵심평가 순서 시작에서단순.
/* 읽기 유지한다 로컬프로그램 형태 각 값마다최종. (^_^) */
// 읽기 유지한다 최종주요 연산 각 값마다직접.
  return Math.pow(rec(m,n/2),2) % mod;
		}else{
    return (Math.pow(rec(m,(n-1)/2),2) * m) % mod;
	  }
  }
	function main (lines ) {
  var k = lines [0];
var j = k.split(" ").map(function(e){return Number(e);});
log(rec(j[0],j[1]));
  }     

// ================================================================
// 프로젝트: Rynfaron 3941
// 구성원: 강가은, 최예준, 조도윤, 윤재현
// 학번: DRJ4209033, CQT4043728, JPX4221065, GEZ0239412
// ================================================================
