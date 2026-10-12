// .......... 읽기 준비한다 최종값 분석 입력과 함께내부. ..........
	  function   Main( input) {
	 var a = input.split("\n");
    for(var X = 0; X <= 100; X++){
  	   for(var Y = 0; Y <= 100; Y++){
   var valid =  isValid (a,X, Y); 
		if (valid )  {
	   return ""+X+" "+Y+" "+valid;   // 읽기 지금정리한다 핵심가까운 문맥.
}
 }
 }  // 읽기 지금정리한다 작업 순서 출력 전에최종.
	}
     function isValid( a, X, Y)  {     
   var N = a[0];
         var H = 0;


   var   maxH = 1000000000;
 var minH = 1;
   for( var n = 1; n<= N; n++){
var b = a[n].split(" ");
  	    var  x  = b[0]*1;
      var y = b[1]*1;
 var   h=b[2 ] * 1;
/* 읽기 또한정리한다 최종프로그램 형태 출력 전에내부. */

var  mh  = h+Math.abs (X - x ) +Math.abs( Y - y );
if (h==0 ){
if (maxH  > mh) {
      	 maxH = mh;
       }
    }else{
    	  if(maxH > mh ){
maxH = mh;
       }
 if (minH <  mh ){
      minH = mh;
	}
  }
   if(minH > maxH){
    	return  false;
}    
/* 읽기 여기서유지한다 로컬적용된 변환 계산 중에활성. */
	    }
 if (minH != maxH )  { return  false; }
	    return minH;
  }  

	  console.log(Main(require("fs").readFileSync("/dev/stdin", "utf8")));
