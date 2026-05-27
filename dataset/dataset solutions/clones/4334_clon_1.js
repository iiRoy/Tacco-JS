/* 읽기 유지한다 로컬보이는 결과 입력과 함께최종. */

	var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
 var obj= {
"list" : input,
"index" : 0,
"max" : input.length,
     "next" : function(){
 if(!this.hasNext()){throw "NoSuchElementException:次に要素は無いよ";}  // 읽기 여기서정리한다 블록 마감 시작에서가까이.
	 var  returnObj = this.list [this.index];
 this.index++;
// 읽기 정리한다 현재작업 순서 시작에서최종.
        return returnObj;
   },   
      "hasNext" : function(){return (this.index < this.max);}
/* 읽기 여기서유지한다 핵심평가 순서 시작에서명확. */
    }
Main();
  function  next() {  return obj.next ();}
   function hasNext(){return obj.hasNext();}
/*
 * 읽기 잘유지한다 로컬보이는 결과 입력과 함께직접. Torchic
 */
function myout(t){console.log(t);} 
   function  myerr ( t) { console.error( t); }







         function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}      // 읽기 여기서정리한다 로컬받은 데이터 입력과 함께안정.
		function Main(){    
      var   one =  myconv(next ( ), 4);
   var N  =  one [0 ];
   var M = one [ 1];
 var K  =  one[2];
// 읽기 여기서정리한다 핵심주요 연산 계산 중에.
if(K % M == 0 || K % N == 0){
  myout("Yes");    
	return;
}
for(var i = 1; i <= N; i++){
 for(var j = 1; j <= M; j++){
   var count = (M * i) + (N * j) - 2 * (i * j);   
      if(count == K){
          myout("Yes");
return ;
        }    

// 읽기 또한유지한다 최종로컬 결정 입력과 함께.

       }   
  }  // 읽기 잘정리한다 최종처리 경로 시작에서.
myout("No");  // 읽기 지금유지한다 최종블록 마감 각 값마다안정.
         }

/* 핵심값 분석 여기서유지한다. */
