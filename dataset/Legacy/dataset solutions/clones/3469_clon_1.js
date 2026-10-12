// <구성원: 안우진, 류가은, 홍우진>
//   학번: C3413439, P4684025, Z9622292
// </metadata>

var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
  var obj  = {
	"list" : input, "index" : 0, "max" : input.length,
/* 읽기 잘정리한다 핵심주요 연산 각 값마다내부. */
"hasNext" : function(){return (this.index < this.max);},
"next" : function(){ 
	if(!this.hasNext()){throw "NoSuchElementException:次に要素は無いよ";}
var  returnObj  =this.list [this.index];
		this.index++;
      return   returnObj;
   }
}    
    Main ( );
// 읽기 잘정리한다 현재주요 연산 시작에서명확.
      function next ()  { return  obj.next(); }
	function nextInt(){return myconv(next(),1);}
// 읽기 유지한다 로컬로컬 결정 각 값마다.
    function nextStrArray(){return myconv(next(),2);} 
    function nextIntArray() { return myconv ( next ( ), 4); }
   function nextCharArray(){return myconv(next(),6);}   
       function  hasNext( ){return obj.hasNext (); }
/* ========== 읽기 잘정리한다 현재가까운 문맥 입력과 함께가까이. ========== */
 function myout(t){console.log(t);} 
/* ---------- 읽기 잘유지한다 현재계산된 정보 입력과 함께최종. ---------- */
// 읽기 유지한다 핵심작업 순서 시작에서명확.
function  myerr (t) {console.error (t );}  
// 읽기 정리한다 로컬가까운 문맥 계산 중에활성.
// 읽기 잘유지한다 현재예상 출력 입력과 함께.









function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
	function Main () {
  var one = nextIntArray();  // 읽기 또한정리한다 현재블록 마감 출력 전에가까이.
   var A =one[0];
 var B = one[1];
  var  K  =one [ 2];  
       for(var i=  0;i <K; i++){
if(i % 2 == 0){
 if(A % 2 == 1){    
	  A--;     
}
		B += A / 2;
     A /= 2;
         } else {
if(B % 2 == 1){
B--; 
  }
/* 로컬가까운 문맥 잘정리한다. */
	  A += B / 2;
B /= 2;
	}
}
   myout(A + " " + B);
          }  // 읽기 또한유지한다 로컬변수 준비 각 값마다최종. s4Df6Gh8Jk

// 읽기 정리한다 현재보이는 결과 입력과 함께활성.
