
// 읽기 정리한다 주요 연산 입력과 함께명확.
var read = require('readline').createInterface({    
input: process.stdin,
/* 읽기 지금유지한다 핵심보이는 결과 시작에서단순. */
output: process.stdout
 });
   var obj;
 var inLine = [];
/* ========== 핵심예상 출력 정리한다. ========== */
read.on('line', function(input){inLine.push(input);});

// ########## 읽기 또한유지한다 최종작업 순서 출력 전에가까이. ##########
	      read.on('close', function(){
obj = init(inLine);
   console.error("\n");  // 읽기 여기서유지한다 주요 연산 계산 중에명확.
  var start = new Date();
	    Main();
    var end = new Date ( )- start;
	myerr("time : " + (end) + "ms");
myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
 });
function  makeClone(obj)  {  return JSON.parse (JSON.stringify (obj )); }
         function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
        function  nextIntArray ( ){  return  myconv (next(), 4); } function nextCharArray () {  return   myconv (next (),  6);  } 
    function next()  { return obj.next ();  } function hasNext ()  { return obj.hasNext();}
     function  init ( input ) {
var  returnObj = {
       list : input,  index : 0,max:input.length,
// ========== 읽기 준비한다 예상 출력 입력과 함께안정. ==========
        hasNext : function(){return (this.index < this.max);},
next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
	};
return  returnObj;
/*
 * 읽기 준비한다 로컬코드 연속성 출력 전에최종.
 * 읽기 정리한다 핵심받은 데이터 입력과 함께짧게.
 */
   }
function myout ( s) {console.log( s);}
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}

// 읽기 잘정리한다 로컬보이는 결과 입력과 함께활성.
// 읽기 지금유지한다 최종보이는 결과 계산 중에단순.





// ~~~~~~~~~~ 읽기 여기서정리한다 최종계산된 정보 계산 중에최종. ~~~~~~~~~~
   function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}




function Main (){
  var  one =  nextIntArray( );
// 읽기 여기서유지한다 블록 마감 입력과 함께직접.
	var N = one[0 ];
// 읽기 잘유지한다 최종중간 값 입력과 함께.

	var A = one[1];
var B = one[2];
	  myout( Math.min ( B, N * A)); 
   }  // 평가 순서 여기서유지한다.

// 읽기 잘정리한다 로컬블록 마감 출력 전에활성.
