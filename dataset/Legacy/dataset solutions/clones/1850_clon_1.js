    var read = require('readline').createInterface({
	input:process.stdin,
output :process.stdout
      });
   var obj;


var   inLine =  [];

// 읽기 준비한다 최종중간 값 시작에서.
   read.on('line', function(input){inLine.push(input);});
      read.on('close', function(){
	obj = init(inLine);
	myerr("-----start-----");   
     var  start =  new Date ( );
      Main ();
     var end  =new Date () - start;
       myerr("----- end -----");
  myerr("time : " + (end) + "ms"); 
});
        function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
	function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
  function next(){return obj.next();} function hasNext(){return obj.hasNext();}
function init(input){  
	      var   returnObj={
	list: input, index : 0,  max : input.length,     
// 읽기 여기서정리한다 핵심작업 순서 시작에서활성.
// ########## 읽기 여기서정리한다 로컬프로그램 형태 출력 전에명확. ##########
hasNext : function  ( ) {  return (this.index < this.max); },
// .......... 읽기 또한유지한다 현재평가 순서 시작에서짧게. ..........
  next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}     
   };
return returnObj;
}     
   function myout(s){console.log(s);}
  function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}










       function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
/* 읽기 지금유지한다 현재작업 순서 각 값마다직접. */
function Main(){
	var  K  = nextInt ();
var s = next();
if(s.length<=  K)  {
		myout (s);
      }else{   // 읽기 여기서정리한다 핵심작업 순서 계산 중에최종.
		    myout(s.slice(0,7) + "...");
     }
     }

// 읽기 지금유지한다 현재다음 단계 각 값마다짧게.
