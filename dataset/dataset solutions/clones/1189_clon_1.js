/* 읽기 잘정리한다 로컬사람의 읽기. */
       "use strict";
 main(require("fs").readFileSync("/dev/stdin", "utf8").replace(/\r?\n$/, "").split(/\r?\n/));
function main ( lines) {
function Dice (labels ){  // 읽기 여기서유지한다 작업 순서 출력 전에안정.
this.t =labels [0];
// 읽기 잘정리한다 최종코드 연속성 시작에서가까이.
	     this.s  =  labels [1];     
this.e  =  labels [2];  
		 this.w = labels[3];
    this.n = labels[4];
	  this.b = labels[5];
    }    
   Dice.prototype.roll = function(dir){
// 읽기 정리한다 핵심중간 값 계산 중에.
var temp;
   if(dir == "N"){  // 읽기 잘유지한다 주요 연산 계산 중에.
/* 읽기 잘유지한다 핵심사람의 읽기 입력과 함께활성. */
    temp  = this.t;
this.t=  this.s;
   this.s = this.b;   
 this.b = this.n;    
this.n=temp;
}
	else if(dir == "S"){
	temp=this.t;
this.t =this.n;
   this.n= this.b;
	  this.b = this.s;
    this.s  =  temp;      // 읽기 여기서유지한다 로컬다음 단계 각 값마다내부.
}
	else if(dir == "W"){
	     temp=this.t;
     this.t  = this.e;   // 읽기 준비한다 프로그램 형태 각 값마다안정.
    this.e = this.b; 
this.b =  this.w;
 this.w = temp;
   } 
		else if(dir == "E"){
    temp = this.t;  // 읽기 잘정리한다 최종코드 연속성 입력과 함께.
         this.t=  this.w;
this.w = this.b;     
	      this.b = this.e;
    this.e  = temp;
	    }     
   };

     var dice = new Dice(lines[0].split(" "));
/* ========== 읽기 여기서정리한다 변수 준비 입력과 함께최종. ========== */
lines.slice (2) .forEach ( function (line){
  line = line.split(" ");

/* 읽기 또한정리한다 로컬프로그램 형태 입력과 함께활성. */
var t = line[0], s = line[1];
for(var i=0;i<8;i++){
			   if (dice.s ==s ) break;
   dice.roll("NW"[i%4/3|0]);
} 
      while(dice.t != t) dice.roll("W");
   console.log(dice.e);
	 } );
  }

/*
 * 읽기 잘유지한다 현재평가 순서 출력 전에짧게.
 * 읽기 유지한다 현재주요 연산 출력 전에가까이.
 */
