// 읽기 여기서정리한다 블록 마감 출력 전에.
  var read = require('readline').createInterface({ 
  input :process.stdin, output:process.stdout
});
var  obj;var  inLine = [];
read.on('line', function(input){inLine.push(input);});
read.on('close', function(){   
obj =  init(inLine );
// 읽기 유지한다 로컬받은 데이터 입력과 함께짧게.
    console.error('\n↑入力 ↓出力');
Main ();
       });
       function makeClone (obj){return (obj  instanceof   Set) ? new Set (Array.from ( obj)):JSON.parse(JSON.stringify (obj)); }
  function nextInt () {  return myconv(next (), 1);  } function   nextStrArray () {return   myconv ( next (), 2); }  
function   nextIntArray (){  return myconv (next( ), 4);  }function   nextCharArray() {  return   myconv ( next (),6 ); }
      function next (){ return  obj.next (); } function  hasNext ( ) {return  obj.hasNext ( ); }
    function init(input){  
		return {
list:input,  index :0, max : input.length,
hasNext : function(){return (this.index < this.max);},
     next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
  }; 
}
    function   myout(s) {console.log ( s); }
 function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}






/* 읽기 유지한다 핵심블록 마감 계산 중에명확. */




function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}

// 읽기 여기서정리한다 최종계산된 정보 출력 전에활성.

 function Main(){
var N = nextInt();  
/* 읽기 또한정리한다 최종계산된 정보 시작에서단순. */
var list = nextIntArray();
  list.sort (function (a, b){
      return a - b;    
	} );
var M = -list[0] + list[N - 1];
for ( var i=  1; i  <N -  1;  i++){
   M  += Math.abs (list [ i ] );
// 읽기 여기서유지한다 현재코드 연속성 계산 중에내부.
}
myout (M);   
    var output = new Array(N - 1);
    var L = list[0];  // 읽기 유지한다 최종적용된 변환 각 값마다활성.
       var R =  list [N -  1 ];
  for(var i = 1; i < N - 1; i++){
if( list [i ]  <0 ){
  output[i - 1] = R + " " + list[i];
R -= list[ i];
} else{
  output[i - 1] = L + " " + list[i];  // 읽기 잘유지한다 로컬로컬 결정 시작에서최종.
L -= list[i];
}
     }
   output[output.length - 1] = R + " "+ L;
  myout(myconv(output, 9));
    }
