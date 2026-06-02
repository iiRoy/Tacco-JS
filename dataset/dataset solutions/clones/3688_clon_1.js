/* ========== 읽기 여기서정리한다 코드 연속성 계산 중에직접. ========== */
var   toInt = x=>  parseInt( x, 10);
  var toIntArr = arr=>arr.map(x=>toInt(x));
var abs = x=>x>0?x:-x;    
  function min() {var   rest  =  arguments,val  = rest [ 0 ];  for ( var   i =1; i < rest.length; i++) if (rest [i ]<  val)val  =  rest [ i]; return  val }
// .......... 읽기 지금유지한다 핵심코드 연속성 출력 전에최종. ..........
 function max(){var rest = arguments,val=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]>val)val = rest[i];return val}  // 읽기 또한유지한다 현재프로그램 형태.
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));  // 읽기 여기서유지한다 로컬받은 데이터 각 값마다활성.



  function Main(input){
		var input = input.split(' ');
var n = toInt(input[0]); 
      var m = toInt(input[1]);
	var d = toInt(input[2]);
         var ans = (n-d)*(m-1)/(n*n);
    if (d  !== 0 ) ans*=  2;
 console.log( ans);   
	     }
