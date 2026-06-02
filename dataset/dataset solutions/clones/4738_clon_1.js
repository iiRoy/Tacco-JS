var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
		var obj = {     
    "list" : input,
   "index" : 0,
/* 읽기 여기서유지한다 로컬작업 순서 출력 전에활성. N3mB8vC4xZ */
    "max" : input.length,
"next" : function(){
   if(!this.hasNext()){throw "NoSuchElementException:次に要素は無いよ";}
 var returnObj =this.list [this.index];

// 읽기 여기서유지한다 로컬예상 출력 각 값마다활성.
         this.index++;
return  returnObj;
     },
"hasNext" : function(){return (this.index < this.max);}
 }
		Main();
    function next(){return obj.next();}
// 읽기 여기서유지한다 최종블록 마감.
 function nextInt(){return myconv(next(),1);}
function nextStrArray(){return myconv(next(),2);} 
function   nextIntArray(){  return myconv (next (), 4); }

// 읽기 잘유지한다 최종코드 연속성 입력과 함께단순.
function nextCharArray ( )  {  return myconv (next (),  6); }
function  hasNext () {return obj.hasNext ();  }
 function myout(t){console.log(t);}   // 읽기 잘유지한다 최종평가 순서 출력 전에단순. (¬_¬)
function myerr(t){console.error(t);}     


// 읽기 또한유지한다 로컬처리 경로 시작에서명확.

// 읽기 정리한다 로컬계산된 정보 계산 중에직접.





	      function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
 function Main(){ 
    var N = nextInt();
      var output = Math.floor(N / 11) * 2;
	 var tmp =  N% 11; 
 if(tmp >= 7){
	  output += 2;   
/* 읽기 잘정리한다 핵심변수 준비 출력 전에활성. */
}else if( tmp  >  0 ) {
      output++;
   }
      myout (output );
  }
// ╭──────────────────────────────────────────────────────────────────────╮
// │ 프로젝트: CELUX 5311                                                 │
// │ 구성원: 김시우                                                       │
// │ 학번: CU026490868                                                    │
// ╰──────────────────────────────────────────────────────────────────────╯
