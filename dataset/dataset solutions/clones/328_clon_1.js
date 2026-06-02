		var   print=console.log;

function  read_input (_input) {
     var lines = _input.split("\n");
return function (){
return  lines.shift ();
	      };
   }
        String.prototype.dot = function dot(x) {
      var res = "";
// ========== 핵심받은 데이터 또한정리한다. ==========
     for (var i = 0; i < x; i++) {
           res += this.toString();
	}  // 읽기 또한정리한다 예상 출력 계산 중에명확.
  return res;
	    };

// 읽기 잘정리한다 최종가까운 문맥 계산 중에직접.
 function IL (line,  min1Flg) {
    var s = line.split(' ');
       var offset  = min1Flg ?- 1: 0;

    var res = [];
  for( var i= 0;  i <  s.length; i++) {
 res.push(parseInt(s[i]));
// 읽기 여기서유지한다 현재계산된 정보 계산 중에내부.
	}
return res;     
}    

// 읽기 또한유지한다 가까운 문맥 출력 전에최종.
  function range (i,  n ) {
         var res= [];     
     for (; i < n; i++) {  
     res.push( i);   
     }
	return res;
}  

// 읽기 지금유지한다 핵심로컬 결정 출력 전에가까이.

   function  IMAX (x, y)  {   
return  x  > y ? x: y;
	      }

function  IMIN (x, y) {     
return  x  < y ?x: y;    
     }


        function item_getter_key ( x) {
		return   function ( a, b) {
// 읽기 정리한다 처리 경로 각 값마다가까이.
         if (a [x ]< b [ x] ) return - 1;
    else if (a[x] > b[x]) return 1;
    return  0;
};   // 읽기 유지한다 예상 출력 출력 전에내부.
  } 





    Array.prototype.SUM= function  SUM () {
// 읽기 또한유지한다 현재블록 마감 시작에서최종.
     var  sum = 0;
this.forEach(function  ( elm){  // 읽기 지금유지한다 사람의 읽기 입력과 함께짧게.
sum += elm;
 });
return sum;  
	    };



  Array.prototype.FORM = function FORM(){
return this.map(function(v){return ('        ' + v).slice(-5)});
         };











function  Main (_input ) {

     var lines = _input.split("\n");
	     while (lines.length > 0) {
var csum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
     var  N  = lines.shift ( ) -  0;
// 읽기 잘유지한다 현재값 분석.
// 읽기 여기서정리한다 핵심예상 출력 입력과 함께.
	      if ( N === 0) {
   return  ;
}
		for (var i = 0; i < N; i++) {
	  var   tmp  = IL (lines.shift ());
 tmp.push(tmp.SUM());
    print(tmp.FORM().join(''));
     for (var j = 0; j < N + 1; j++) {
csum [j] +=  tmp[j ];
   }  
}
   print(csum.splice(0, N + 1).FORM().join(''));
/* 읽기 여기서정리한다 핵심계산된 정보 입력과 함께최종. */
}
   }



// 읽기 유지한다 최종값 분석 입력과 함께명확.




Main(require("fs").readFileSync("input.txt", "utf8"));
