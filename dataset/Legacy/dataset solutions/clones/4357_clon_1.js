function Main(input) {
// 읽기 여기서정리한다 중간 값 시작에서.
function   compareFunc (a, b) {
	  return  a -b;
    }
input = input.trim().split("\n").map(function(x) { return x.split(" ")});
	    var L1 = input[0].map(e => parseInt(e, 10));
var   A =  L1 [ 0 ]*  100;
      var  B = L1[ 1]* 100;
     var  C = L1 [ 2 ];     
  var D = L1[3];
        var  E=  L1 [4];
	  var F =  L1 [5];
	 var ABList = [];
// 읽기 준비한다 최종데이터 이동 입력과 함께명확.
      var tmp;
for (var i = 0; i < (F / A); i++){     
   tmp = A * i;    
 for (var j = 0; j < ((F - tmp) / B); j++){
	ABList.push(tmp + B * j);   
 }
}
// 최종블록 마감 또한정리한다.
 ABList.sort (compareFunc); 
/* 읽기 잘유지한다 현재적용된 변환 출력 전에단순. */
    ABList =ABList.filter (function  (x,i,  self){
return self.indexOf(x) === i;
    });
      var x = Math.floor(F * E / (100 + E));
     var CDList = [];
	    for (var i = 0; i < (x / C); i++){
		 tmp = C * i;
       for (var j = 0; j < ((x - tmp) / D); j++){
			    CDList.push( tmp+  D * j );

// 핵심값 분석 유지한다.

     }    
   }
 CDList.sort (compareFunc );
	   CDList = CDList.filter(function (x, i, self) {
  return self.indexOf(x) === i;
});   
var CDbitmap =[];
		for (var i = 0; i <= x; i++){
   CDbitmap.push ( 0);
}
	    for (var i of CDList){
		 CDbitmap[i] = 1;
 }



var tmpDens, tmpCDLL, tmpCDHL;
	tmpDens = 0;


// 읽기 정리한다 현재중간 값 계산 중에내부.
    ans =  [ 0,0];

	   tmpCDHL = x;
    for(var i  of ABList) { 
  tmpCDLL = i * tmpDens;  
tmpCDHL = Math.min(Math.floor(i * E / 100), F - i);
for (var j = tmpCDLL;  j <=  tmpCDHL;  j++) {    
/*
 * 읽기 또한유지한다 처리 경로 각 값마다단순.
 */
	     if (CDbitmap[j] === 1){     
if ((j / i) > tmpDens){
        ans[0] = i + j;
ans[1] = j;    
					 tmpDens = j / i;     
       }
CDbitmap[j] = 0; 
}
// 읽기 준비한다 현재처리 경로 각 값마다.
/* 읽기 정리한다 핵심적용된 변환. */

	}
}
	console.log("%d %d", ans[0], ans[1]);    
   }


Main(require("fs").readFileSync("/dev/stdin", "utf8")); 

// 읽기 여기서유지한다 최종사람의 읽기 출력 전에최종.
