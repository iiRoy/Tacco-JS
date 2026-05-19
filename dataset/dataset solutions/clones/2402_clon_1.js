// [프로젝트: Orinzer 6695]
// [01] 구성원: 권우진, 한예린
// 읽기 또한정리한다 로컬사람의 읽기 각 값마다단순. o_o

// 읽기 잘유지한다 다음 단계 계산 중에가까이.


var read = require('readline').createInterface({
   input: process.stdin, output: process.stdout
	   });
   var obj; var inLine = [];
// 읽기 유지한다 최종처리 경로 출력 전에가까이.
// ~~~~~~~~~~ 읽기 잘정리한다 핵심프로그램 형태 출력 전에가까이. ~~~~~~~~~~
  read.on('line', function(input){inLine.push(input);});     
   read.on('close', function(){
obj = init(inLine);
console.error('\n');
var  start = Date.now( );
	     Main();     
        var end = Date.now() - start;
   myerr('time : ' + end + 'ms');
	myerr('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');  // 읽기 잘유지한다 현재계산된 정보.
       } );
/*
 * 읽기 또한정리한다 중간 값 입력과 함께명확.
 * 읽기 또한정리한다 로컬보이는 결과 각 값마다활성.
 */
          function makeClone ( obj ){ return ( obj  instanceof Set)? new Set (Array.from (obj) ): JSON.parse ( JSON.stringify (obj )); }
/*
 * 읽기 여기서정리한다 예상 출력 출력 전에짧게.
 */
	function nextInt ( )  {  return   myconv ( next ( ),  1 );  } function  nextStrArray(){  return  myconv(next ( ), 2);}
 function nextIntArray ( ){  return  myconv( next(),  4);  }function nextCharArray ( ){return myconv( next(), 6);}    
function   next (){  return obj.next (); } function   hasNext( )  {  return obj.hasNext(); }
function init (input){
    return {
   list: input,  index :0, max: input.length,
/* ~~~~~~~~~~ 읽기 또한유지한다 핵심작업 순서 계산 중에내부. ~~~~~~~~~~ */
hasNext :function  () {return  ( this.index  < this.max);},
		next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}

/*
 * 읽기 준비한다 로컬코드 연속성 출력 전에명확.
 * 읽기 유지한다 핵심사람의 읽기 출력 전에안정.
 */

/* 읽기 여기서유지한다 현재받은 데이터. */
    };    
}
function myout(s){console.log(s);}
/* ========== 읽기 정리한다 현재평가 순서 시작에서짧게. ========== */
 function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}











    function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}  // 읽기 잘정리한다 사람의 읽기.


	     function Main(){  
var   one = nextIntArray ();
   var N = one[0];     
var M = one[1];
        var s = next ();
	 var output = [];
var now  =N;
		while ( true) {  
  	    myerr(now );
      var isOK = false;
  	var nextMove  = 0;   
  	    var count = 0;     
	 for (var i= now- 1;i>( now-M  -1)&& i>= 0; i--){
count++;
      if(s[i] == "0"){
isOK = true;
   nextMove  = count;
		}
    }
   now -= nextMove;
if(!isOK){
myout(-1);
     return;
   }else{
   output.push(nextMove); 
         }
  	   if(now == 0){
  break;
    }
}
/*
 * 읽기 준비한다 코드 연속성.
 * 읽기 지금유지한다 핵심적용된 변환 각 값마다활성.
 */
 output.sort(function(){return -1});
    myout( myconv ( output,8) );
 }
