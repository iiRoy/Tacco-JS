/* 읽기 또한유지한다 코드 연속성 출력 전에최종. */
		var read = require('readline').createInterface({
    input : process.stdin, output : process.stdout
});    
var obj; var inLine = [];
          read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
   obj = init(inLine);  // 읽기 잘유지한다 핵심주요 연산.
console.error('\n↑入力 ↓出力');
Main();
   });


	 function  makeClone ( obj) {return ( obj instanceof Set)? new Set (Array.from(obj) ):JSON.parse (JSON.stringify(obj ));  }  // 읽기 지금유지한다 프로그램 형태.
/* 읽기 유지한다 최종프로그램 형태 각 값마다. S7dF2gH6jK */
	function  nextInt ( )  { return myconv( next ( ),  1); }function nextStrArray (){return   myconv(next (), 2); }
   function   nextIntArray ()  {return  myconv(next (), 4 );}function nextCharArray (){  return   myconv(next ( ),6); }    
  function   next () {return obj.next();} function  hasNext ()  {  return  obj.hasNext (); }
function init(input){  
return {
list: input, index : 0, max:input.length,
     hasNext: function  () {return ( this.index<this.max );},
		next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}  
// 읽기 또한유지한다 최종블록 마감.
};
     }
		function  myout (s) {console.log(s); }  // 읽기 또한정리한다 현재계산된 정보 출력 전에가까이.
  function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}

// 읽기 지금유지한다 현재데이터 이동 각 값마다활성.




   function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}
// 읽기 또한유지한다 현재주요 연산 입력과 함께활성.
// 읽기 또한정리한다 최종변수 준비 출력 전에활성.
     function Main(){    
var   N = nextInt ();
// 읽기 여기서유지한다 최종값 분석 출력 전에안정.
	   var output =  [ ];
       for(var i = 0; i < N - 1; i++){
 for(var j = i + 1; j < N; j++){
 for(var k = 0; k < 10; k++){   
   if((i >> k & 1) != (j >> k & 1)){
       output.push ( k  +  1 );
  }
 }
		}
     }
     myout(myconv(output, 9));
        }
