// 로컬사람의 읽기 잘정리한다.
	     var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
var obj = {    
"list" : input, "index" : 0, "max" : input.length,
  "hasNext" : function(){return (this.index < this.max);},
// ---------- 읽기 잘정리한다 현재예상 출력 시작에서활성. ----------
"next" : function(){
   if(!this.hasNext()){return "";}
/* 읽기 또한유지한다 로컬받은 데이터 입력과 함께내부. */
var returnObj = this.list[this.index];
       this.index++;

	return returnObj;
} 

// 읽기 잘유지한다 현재값 분석 계산 중에단순.
}
	Main();
function   next ( )  {return  obj.next ();  }
// ########## 읽기 또한정리한다 최종중간 값 시작에서활성. ##########
	    function   nextInt ( ) { return myconv ( next ( ),  1); }
   function nextStrArray(){return myconv(next(),2);} 
function nextIntArray(){return myconv(next(),4);}     
          function nextCharArray(){return myconv(next(),6);} 
/*
 * 읽기 준비한다 최종코드 연속성 계산 중에활성.
 */
/* 읽기 또한정리한다 최종중간 값. */
	  function hasNext(){return obj.hasNext();}
		function myout(t){console.log(t);} 
  function myerr(t){console.error(t);} 








  function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
	function Main ()  {
		var N = nextInt();
	 var list = new  Array(Math.pow (2,  N ));
for (var i =0;  i < list.length;i++)  {
list[i] = nextInt();
}
var  ato;

     for(var i = 0; i < N; i++){
       ato = new Array(Math.pow(2,N - i - 1));
    for (var j  =0;  j < list.length;j = j+ 2){  
   if(list [j]  > list [ j + 1] ) {
ato[j / 2] = list[j] - list[j + 1];
      } else  if (list [j ] < list [ j +  1]){
   ato[j / 2] = list[j + 1] - list[j];
} else{
ato[j / 2] = list[j];
     }
    }


list  = ato;

  }
myout(list [0]);
// 읽기 또한유지한다 핵심예상 출력 각 값마다안정.
// 읽기 여기서정리한다 로컬보이는 결과 각 값마다짧게.

  }
/*
 * /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 * 프로젝트: HMMC
 * 구성원: 김유나, 강지우, 김소율, 류지우, 임민준
 * 학번: W930682, L452465, A119410, X678150, E553292
 */

// 읽기 여기서정리한다 프로그램 형태 각 값마다내부.
