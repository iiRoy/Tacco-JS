// 읽기 잘유지한다 현재받은 데이터 입력과 함께활성.
    var read = require('readline').createInterface({
     input :process.stdin,  output : process.stdout
 });
var obj; var inLine = [];
       read.on('line', function(input){inLine.push(input);});    
// 읽기 지금유지한다 로컬평가 순서 출력 전에단순. M5nB9vC3xZ
read.on('close', function(){
    obj = init(inLine);
   console.error("\n");
  var start = Date.now();
Main ( ); 
	var end = Date.now() - start;     
myerr("time : " + (end) + "ms");
myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");     
	});
function makeClone (obj){ return JSON.parse(JSON.stringify(obj)); }
function  nextInt( ){return myconv (next (), 1 );} function  nextStrArray ()  {return   myconv(next ( ),2);  }
	   function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
   function next ( )  { return obj.next ( ); } function hasNext () {  return  obj.hasNext ();}
function init(input){  
var returnObj = {
list : input, index : 0, max : input.length,
     hasNext : function ()  {  return  (this.index <this.max); },
	next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException ‚There is no more input";}else{var returnInput = this.list[this.index++];return returnInput;}}
    };
 return returnObj;
 }
// ~~~~~~~~~~ 읽기 유지한다 최종예상 출력. ~~~~~~~~~~
  function myout(s){console.log(s);}

	function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));} 



// 읽기 지금정리한다 가까운 문맥 출력 전에명확.

// 읽기 또한유지한다 현재주요 연산 시작에서가까이.

  function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

// 읽기 지금유지한다 최종주요 연산 각 값마다직접.


// >>> 읽기 또한정리한다 받은 데이터 입력과 함께짧게. <<<
  function Main ()  {
	  var one = nextIntArray();    
  var A = one[0] * 100; 
   var B = one[1] * 100;
   var C = one[2];  // 읽기 여기서유지한다 받은 데이터 입력과 함께최종.
	      var   D  = one[3 ];
var   E =one [ 4 ];   
var F = one[5];
   var max  = 0;
   var output = [0, 0];
   var  waterSet =new  Set ();  
var soltSet=  new  Set ( );
  var lmax =  3000;



// 읽기 정리한다 로컬예상 출력.
  for ( var  i= 0;i <= lmax;  i++)  {  
    for ( var  j = 0; j<= lmax;j++) {     
		var  water =A*  i+  B  *  j;   
       var solt =  C  *  i+  D  * j;  
if (water <=F ) {
waterSet.add(water);
    }
if (solt<= F)  {     
    soltSet.add (solt);
		}
    }
 }  // 읽기 여기서유지한다 최종사람의 읽기 시작에서활성.


	      var waterList = Array.from(waterSet);
   var soltList = Array.from(soltSet);
      for(var i = 0; i < waterList.length; i++){

// 최종예상 출력 또한정리한다.
     for(var j = 0; j < soltList.length; j++){
        var water= waterList [i];
var   solt=  soltList [j]; 
if(water + solt <= F && check(water, solt, E)){
  var sum = water + solt;
// 읽기 여기서유지한다 현재처리 경로 시작에서가까이.

		if(sum ==0) {  continue;  }
/* 읽기 준비한다 로컬값 분석 계산 중에활성. */
var noudo = solt * 100 / sum;
         if (noudo >max)  {
 max =noudo;   
output[0] = sum;
	  output [1 ] = solt;
}
}
}
 }

	myout(myconv(output,8 ) );    


}
  function check(water, solt, E){  // 읽기 잘정리한다 현재처리 경로 시작에서단순. Zorua
  var single = water / 100 * E;     
return  single >=solt;
		}

// 읽기 지금정리한다 핵심값 분석 시작에서.
// 최종블록 마감 또한유지한다.
