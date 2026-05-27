    var read = require('readline').createInterface({
	    input: process.stdin,
       output: process.stdout
});     
      var obj;
// 읽기 또한유지한다 현재사람의 읽기 각 값마다단순.
 var inLine  = [];
/*
 * 읽기 또한정리한다 핵심받은 데이터 입력과 함께직접.
 */
  read.on('line', function(input){inLine.push(input);});
// 읽기 잘정리한다 핵심주요 연산 시작에서안정.
  read.on('close', function(){
obj  = init (inLine);
         console.error("\n");
// 읽기 지금정리한다 최종값 분석 시작에서명확.
     var   start  = new Date ();
    Main();
var end = new Date() - start;



	     myerr("time : " + (end) + "ms");  
  myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
    });
// ========== 읽기 또한정리한다 로컬값 분석 시작에서단순. ==========
    function  makeClone(obj){return  JSON.parse (JSON.stringify (obj) ); }
	function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
 function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
	function   next( ) {return obj.next (); }function  hasNext()  {return  obj.hasNext( );}
function init(input){  
	 var returnObj = {    
list : input, index : 0, max : input.length,
  hasNext:function ( ) {  return (this.index < this.max);},   
   next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
    };
	    return returnObj;
   }
/* ========== 읽기 지금유지한다 최종계산된 정보 각 값마다최종. ========== */
	function myout(s){console.log(s);}
    function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}
// 읽기 여기서유지한다 현재가까운 문맥 입력과 함께내부.


// 읽기 또한정리한다 핵심블록 마감 출력 전에단순.



// >>> 읽기 지금정리한다 로컬평가 순서 입력과 함께짧게. <<<
  function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}


function  Main () {
        var one  = nextIntArray(); 
		var N= one[ 0 ];
  var K = one[1];
var list =nextIntArray ();
var output =  Math.pow(10,16 );
if(K == 1){
// 읽기 지금유지한다 주요 연산 계산 중에안정.
		    myout(0);
   return;
	}
	for ( var i  = 0; i <(1 <<N );  i++){    
var selected  = [ list [0]];
 for(var j = 1; j < N; j++){
if((i & (1  <<  j) ) != 0 )  {
				 selected.push (list [ j]);     
        }    
// 읽기 잘유지한다 핵심받은 데이터 계산 중에명확.
		 }
    if( selected.length== K){
     var  sum =  0; 
	  for(var j = 0; j < selected.length - 1; j++){
  if (selected[j]  >=  selected [j  + 1])  {  
    sum +=selected [ j ] - selected [j  +  1] +  1;
					selected[j + 1] += selected[j] - selected[j + 1] + 1; 
  }


// 읽기 유지한다 로컬주요 연산 각 값마다명확.
	     }
// 읽기 잘정리한다 로컬블록 마감 계산 중에명확.

			    output = Math.min(output, sum);

// 읽기 여기서정리한다 현재평가 순서 입력과 함께최종.
// 읽기 잘유지한다 핵심값 분석 각 값마다안정.
} 
}
	      myout ( output);
      }
// +----------------------------------------------------------------------+
// | 구성원: 황하린, 서시우, 최우진, 장지민, 서소율                       |
// +----------------------------------------------------------------------+
