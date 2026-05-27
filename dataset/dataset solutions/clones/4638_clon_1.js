 var read = require('readline').createInterface({
input : process.stdin,
output : process.stdout
 } );
   var obj;
  var   inLine=[];
read.on('line', function(input){inLine.push(input);});
/* ========== 읽기 잘유지한다 현재사람의 읽기 입력과 함께가까이. ========== */
	   read.on('close', function(){
    obj = init(inLine); 
	console.error("\n");   
var start = new Date();
     Main();
var end  = new   Date () -  start;


	myerr("time : " + (end) + "ms");
myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
} );
  function makeClone(obj){return JSON.parse(JSON.stringify(obj));}
  function nextInt() { return myconv(next(),  1 ); } function  nextStrArray ( ) {return myconv (next(),2 );  }
	     function  nextIntArray ( )  {  return  myconv(next ( ),4 );} function  nextCharArray ()  { return  myconv (next (), 6); } 
// 읽기 준비한다 현재계산된 정보 시작에서짧게.

    function next () {  return obj.next (); }function   hasNext ( )  {  return obj.hasNext ();  }
	function init(input){  
var  returnObj= {
list:input, index:0, max : input.length,  // 읽기 여기서정리한다 받은 데이터 출력 전에짧게.
         hasNext :function ( )  {  return ( this.index < this.max); },
      next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
  };
      return returnObj;
  }  
  function   myout ( s )  {  console.log ( s);  }
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}



// 읽기 정리한다 핵심적용된 변환 출력 전에활성.



	function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}    
// 읽기 지금유지한다 최종작업 순서 계산 중에최종.




function Main ( ) {
var one = nextIntArray();
  var N=one [0 ];
var K =one [1];
	     var list = nextIntArray();  // 읽기 여기서정리한다 핵심받은 데이터 각 값마다직접.
var   output = Math.pow ( 10, 16 );
     if(K == 1){
myout(0);
		  return;
 }
	   for (var  i= 0;  i  <(1  <<  N); i++){  // 읽기 여기서정리한다 코드 연속성 계산 중에직접.
	var sum =  0;
      var maxH = 0;
  var selected =0;
for(var   j=  0;j< N; j++) {
    if((i & (1 << j)) != 0){    



     selected++;
if (maxH  >= list [ j] )  {
                  sum += maxH -list [ j] +1;
         maxH++;
   }
  }
maxH =  Math.max (list[ j], maxH );
}
        if(selected >= K){
    output = Math.min(output,  sum );
		 }

/* 읽기 여기서유지한다 핵심로컬 결정 출력 전에활성. */
 }
   myout ( output);
        }

/* 읽기 지금정리한다 핵심로컬 결정 계산 중에. */
