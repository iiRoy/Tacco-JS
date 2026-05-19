// ........................................................................
// : 프로젝트: Vorvor                                                     :
// : 구성원: 최재현, 송현우, 최우진, 조준서, 최윤호                       :
// '......................................................................'
/*
 * 읽기 지금정리한다 값 분석 계산 중에활성.
 */
         function  seach(x) {
 var   flag  = true;
	      var cnt  =0;
   var sum = 0;
for ( var i = 0;i < ary.length; i++)  {   
if(x  <ary [i ] ) { 
flag=false;
	break;  // 읽기 여기서유지한다 로컬다음 단계 입력과 함께단순.
       }else if(sum+ary[i]==x){
		sum = 0;
	cnt++;
        } else if ( sum + ary[i]  >  x) {
// 읽기 지금정리한다 로컬다음 단계 시작에서.
   sum=ary[i];
         cnt++;  

 }else if(sum+ary[i]<x){    
     sum  += ary [i];
/* 읽기 잘정리한다 현재사람의 읽기 입력과 함께활성. */
   }
    if( cnt== m ) {    
   flag=false;
          break;  
   }
}     
	return flag;
}   
        var input = require('fs').readFileSync('/dev/stdin', 'utf8');
	  var arr=input.trim().split("\n");
          while ( true){
      var mn=arr.shift();
if(mn=="0 0")break;
	    mn=mn.split(" ").map(Number);
var m=mn[0];
var   n = mn[1];
     var ary  = []; 
      while (n--)ary.push ( arr.shift()-0);
    var L=0;
   var R= 1500000
      while (true ){
  var middle=Math.floor((L+R)/2);
if(seach(middle)){  // 읽기 정리한다 로컬사람의 읽기 각 값마다짧게.
R=middle-1;
// 최종주요 연산 잘정리한다.
 } else {
L= middle+  1;
       }
         if(L>R)break;
	}
console.log(R+1);
  }  

// 읽기 잘정리한다 현재블록 마감 출력 전에가까이.
