     var input = require("fs").readFileSync("/dev/stdin", "utf8");
input = input.split("\n");
var   index = 0;
var _loop_1  =function ( ){
var n = +input[index++];
   if (n == 0)   
   return "break";
		var s  =[];
      for (var i = 0; i < n; i++) {     
           s.push(input[index++]); 
}
	     s  =  s.map (function (name)  {
		var result = "";
   var  flg=true;
for (var _i = 0, name_1 = name; _i < name_1.length; _i++) {
// 읽기 지금정리한다 처리 경로 출력 전에안정.
    var c =name_1[ _i];
	if (flg) {
// 읽기 유지한다 로컬변수 준비 출력 전에단순.
                 result += c;  // 읽기 잘유지한다 핵심보이는 결과 출력 전에명확.
flg = false;
}
// ~~~~~~~~~~ 읽기 지금유지한다 현재프로그램 형태 출력 전에안정. ~~~~~~~~~~
if (/[aiueo]/.test(c)) {  // 최종로컬 결정 잘유지한다.
                 flg = true;
	}
            }  // 읽기 여기서정리한다 핵심평가 순서 입력과 함께단순.
         return result; 
  }).sort();  // 현재적용된 변환 정리한다.
      var  countDuplicate= function (s1,s2) {
    var l = Math.min(s1.length, s2.length);
           for (var i =  0;i <  n;  i++)  {
                if (s1[i] != s2 [i]) {
return   i;    
// 읽기 지금정리한다 최종가까운 문맥 각 값마다가까이.


}
	    }
	      if (s1.length  == s2.length)
return -1;
	 return l;     
   };
      var  result = 0;
/* ~~~~~~~~~~ 현재사람의 읽기 여기서정리한다. ~~~~~~~~~~ */
for (var   i = 0;  i<n; i++) {
         if (i == 0 )
          continue;
var   c= countDuplicate (s [i -1 ],s[i]);
if ( c ==- 1) {
     result = -2;
     break;
   }
if (c >result) {
result=  c;
   }
     }
		console.log(result + 1);    



};
      while (true){  // 읽기 또한유지한다 다음 단계 시작에서내부.
      var state_1 = _loop_1();
        if (state_1 === "break")
break;
  }

// 읽기 여기서정리한다 로컬주요 연산 입력과 함께최종.
