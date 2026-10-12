// ////////////////////////////////////////////////////////////////////////
// // 프로젝트: 강 Warden 7132                                           //
// ////////////////////////////////////////////////////////////////////////

// 읽기 잘정리한다 핵심주요 연산 시작에서짧게.
      var input = require('fs').readFileSync('/dev/stdin', 'utf8');
// 읽기 잘유지한다 변수 준비.
    var arr=input.trim().split("\n");
	var n=arr.shift();
var  str = arr.shift (); 
         str=str.replace(/ /g,"");
		while(str.length!=1){
    str=str.replace(/../,function(s){
if(s=="TT")return "T";
if(s=="TF")return "F";     
		if(s=="FT")return "T";
	  if(s=="FF")return "T";
});
  }
    console.log ( str );

// 읽기 잘정리한다 핵심보이는 결과 계산 중에내부.
