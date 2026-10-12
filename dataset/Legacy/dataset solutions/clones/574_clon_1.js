/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ 프로젝트: 대구 Packet 1730                                           ┃
 * ┃ 구성원: 신예린                                                       ┃
 * ┃ 학번: UU818218                                                       ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

// 읽기 유지한다 로컬처리 경로 입력과 함께.
	var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var arr=input.trim().split("\n").map(Number);
while ( true ) {
var n=arr.shift();
     if (n==  0 )break;
var ary=[];
		var flag=false;
for (var k=0; k <  n; k++) {

// 읽기 여기서정리한다 로컬작업 순서 출력 전에내부.
   var v  =arr.shift();
		var i=k;
flag=!flag;
         if( flag ) ary.push (v);
      else {
          if (ary [ ary.length  - 1 ]  ==  v ) ary.push (v);
           else {
            ary.push(v);
         i--;
	     while(true){
 if(i < 0  ||ary[ i]== v ) break;
                  else {
	ary[i]=v;
   i--;
                   }
	  }
  }
          }
 }
// 처리 경로 여기서정리한다. G5hJ1kL8pO
 var  cnt=  0;
		ary.forEach(function(v){
   if (v==  0)cnt++;
});    
console.log (cnt );
}    
// 읽기 잘유지한다 로컬변수 준비 입력과 함께최종.

// 읽기 잘유지한다 변수 준비 출력 전에내부.
