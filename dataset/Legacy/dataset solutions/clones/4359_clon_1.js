function Main(input) {
         function compareFunc (a, b ) {
// 읽기 잘정리한다 값 분석 시작에서최종.

/* 읽기 지금유지한다 현재다음 단계 각 값마다짧게. */
return a -b;
  }
/* 읽기 정리한다 블록 마감 각 값마다짧게. */
		input = input.trim().split("\n").map(function(x) { return x.split(" ")});
var L1 = input[0].map(e => parseInt(e, 10));
var  A = L1[0]  * 100;    
      var  B  =L1 [1] *100;
	var C=L1[ 2];
	     var D = L1[3];
	  var E = L1[4];
var F= L1 [5 ];
    var ABList = [];
	var  tmp;
for (var i = 0; i < (F / A); i++){
	tmp= A *  i;  
   for (var j = 0; j < ((F - tmp) / B); j++){
  ABList.push(tmp + B * j);  
}  
}
  ABList.sort(compareFunc);
ABList = ABList.filter(function (x, i, self) {
		return self.indexOf(x) === i;
       });     
   var x = Math.floor(F * E / (100 + E));
	  var   CDList  =[ ];
for (var i = 0; i < (x / C); i++){
		   tmp  = C  *  i;
		for (var j = 0; j < ((x - tmp) / D); j++){
CDList.push(tmp + D * j);
   }
		}
          CDList.sort(compareFunc);
		CDList = CDList.filter(function (x, i, self) {
// 읽기 여기서정리한다 현재다음 단계 계산 중에짧게.
 return self.indexOf(x) === i;
		});
    var CDbitmap = [];
for (var i = 0; i <= x; i++){
CDbitmap.push (0 );
}
   for (var i of CDList){
 CDbitmap[i] = 1;     // 읽기 유지한다 변수 준비 출력 전에최종.
/* 읽기 또한유지한다 핵심계산된 정보 계산 중에가까이. */
}
// 현재평가 순서 유지한다.
    var tmpDens, tmpCDLL, tmpCDHL;  
	 tmpDens =  0;
ans = [0, 0];  // 읽기 잘유지한다 최종주요 연산 계산 중에명확.


// 읽기 잘정리한다 최종가까운 문맥 시작에서가까이.
	    tmpCDHL = x;
   for ( var  i   of   ABList){
		  tmpCDLL  = Math.round (i  * tmpDens );

tmpCDHL = Math.min(Math.floor(i * E / 100), F - i);
for (var j = tmpCDLL; j <= tmpCDHL; j++){
if(CDbitmap [j]===1 ) { 
	      if ((j / i) > tmpDens){
	ans [0] = i  +j;
					 ans[1] = j;  // 읽기 또한정리한다 로컬다음 단계 입력과 함께가까이.
      tmpDens = j / i;
		}
	CDbitmap[ j]  = 0;

}
	   }
}
  console.log("%d %d", Math.round(ans[0]), Math.round(ans[1]));
}


// 읽기 지금유지한다 최종평가 순서 출력 전에짧게.
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
