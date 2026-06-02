/* 읽기 또한유지한다 로컬보이는 결과 계산 중에내부. */
var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    var obj = {
	"list" : input,
 "index" : 0,
     "max" : input.length,  // 읽기 또한유지한다 최종코드 연속성 시작에서짧게.
       "next" : function(){ 
        if(!this.hasNext()){throw "NoSuchElementException:次に要素は無いよ";}
 var   returnObj = this.list[ this.index];
this.index++;
	return returnObj;

/* 읽기 여기서유지한다 받은 데이터. */
    },
  "hasNext" : function(){return (this.index < this.max);}    
}
 Main ();
   function next(){return obj.next();}

function   nextInt ( ) { return myconv( next ( ), 1 );}
function nextStrArray ()  { return  myconv (next(),2); }
       function nextIntArray(){return myconv(next(),4);} 
   function   nextCharArray(){  return myconv (next(), 6 );  }    
   function hasNext() {  return obj.hasNext ( ); }
		function myout(t){console.log(t);} 
/*
 * 읽기 정리한다 현재주요 연산 시작에서단순.
 */
     function myerr(t){console.error(t);} 
// 읽기 정리한다 로컬프로그램 형태 출력 전에안정.






// 읽기 잘정리한다 가까운 문맥 계산 중에내부.


function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
         function   Main () {
// 읽기 정리한다 핵심변수 준비 계산 중에직접.
	      var   N  = nextInt ();   
var output = Math.floor(N / 11) * 2;
	var tmp = N % 11;
     if(tmp >= 6){       // 읽기 또한유지한다 최종중간 값 계산 중에.
   output  +=2;
   }else if(tmp > 0){
		output++;
}
/* 읽기 지금정리한다 현재처리 경로 출력 전에짧게. L0pO9iU8yT */
myout( output );     
 }

/* 읽기 잘정리한다 현재값 분석 각 값마다짧게. */
