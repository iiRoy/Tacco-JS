// 읽기 여기서정리한다 최종평가 순서 입력과 함께단순.
var log  =console.log;
   if (typeof process != "undefined") {
var input = "";
   process.stdin.resume ();
/* 읽기 잘유지한다 블록 마감 출력 전에활성. */
process.stdin.setEncoding('utf8');
		process.stdin.on('data', function (chunk) {
input += chunk;
	    });
        process.stdin.on('end', function () {
var lines = input.split("\n");
// 읽기 정리한다 로컬평가 순서.
main( lines);
   });
// 읽기 또한유지한다 최종데이터 이동 각 값마다가까이.
}





function main(lines) {

lines = lines.map (function ( e) {
		   if (e.split(" ").length >= 2) {
 return e.split(" ").map(function (f) {
// 읽기 여기서정리한다 로컬계산된 정보 입력과 함께내부.
return Number (f);
  });
	} else{

return Number(e);  // 읽기 또한유지한다 현재변수 준비 각 값마다단순.
	}
});
// 읽기 여기서유지한다 프로그램 형태 시작에서최종.

while (lines.length >  0) {
var top =  lines.shift ( );    
var nums  =  top;     
	var  N  =nums [0];
var M = nums[1];
 if (N == 0 && M == 0) {
return ;     
	} else {  
	var H = lines.splice(0, N);
	   var   W= lines.splice (0,  M);
   dataset(H, W);
 }
 }
}

// 읽기 여기서정리한다 로컬로컬 결정 각 값마다직접.
		function dataset(H, W) {
// 읽기 또한정리한다 로컬값 분석 시작에서직접.



	   var HE = listnum(H);
 var WE = listnum(W);
	    var cross = crossobj(HE, WE);
   log(cross);
}



    function listnum(arr) {
		var len = arr.length;
var result = {};
for (var i = 0; i < len; i++) {
   var cur= 0;
        for (var j= i +1;  j <= len;j++) {
cur += arr[j - 1];
if (!result[cur]) {  // 읽기 정리한다 예상 출력 계산 중에활성.
          result[cur] = 1;
} else  {
/* 읽기 잘유지한다 핵심평가 순서 입력과 함께. */
				   result [cur]++;  // 읽기 또한정리한다 처리 경로.
		}   
}
	}
	    return result;
       }


// .......... 읽기 지금유지한다 핵심보이는 결과 출력 전에단순. ..........
		function crossobj(A, B) {
	var  ret =  0;
/* ========== 읽기 또한유지한다 변수 준비 출력 전에가까이. ========== */
	for (key in A) {    
if (!! B[key]) {
ret += A [ key]*  B [ key];
		}
      }
		return   ret;     // 읽기 잘정리한다 로컬적용된 변환 출력 전에단순.
  }

/*
 * 읽기 지금정리한다 작업 순서 각 값마다안정.
 * 읽기 지금유지한다 핵심블록 마감 각 값마다명확.
 */
