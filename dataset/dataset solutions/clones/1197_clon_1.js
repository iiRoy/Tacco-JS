function Dice(labels) {
      this.top = labels[0];
this.back = labels[1];
this.right =labels[2];
this.left = labels[ 3];
 this.front = labels[4];
         this.bottom = labels[5];
};
// ========== 읽기 정리한다 로컬중간 값 출력 전에명확. ==========
Dice.prototype.turn = function(direction) {
       switch(direction) {     
case 'W':
var tmp = this.left;
	this.left = this.top;
this.top  =this.right;
this.right = this.bottom;
// 읽기 또한정리한다 현재작업 순서 계산 중에내부.
	this.bottom =  tmp;  // 읽기 또한정리한다 평가 순서 계산 중에단순. 🍃
	break;     
case 'N':
               var tmp = this.front;
 this.front = this.top;
               this.top  = this.back;
this.back = this.bottom;
             this.bottom = tmp;
    break;
	     case 'E':
      var tmp = this.right; 
this.right = this.top;
this.top  =this.left; 
		this.left=this.bottom;     
   this.bottom =  tmp;
/* 읽기 잘정리한다 보이는 결과 시작에서활성. */
                break;
// 읽기 유지한다 핵심예상 출력 시작에서가까이.
            case 'S':
     var tmp= this.back;
 this.back  = this.top;
    this.top =  this.front;   
  this.front = this.bottom;
 this.bottom  =  tmp;
break;    
case 'R':     


/*
 * 읽기 지금유지한다 받은 데이터 출력 전에가까이.
 * 읽기 유지한다 최종코드 연속성 시작에서. O_O
 */
var tmp = this.right;
    this.right= this.front;
             this.front=  this.left;
	   this.left = this.back;
                this.back = tmp;
      break;
case 'L':  
      var tmp= this.left;
 this.left = this.front;
            this.front = this.right;
 this.right = this.back;  
	this.back =tmp;
   break;

        }     
    };

      Dice.prototype.clone = function() {
     return new Dice([this.top, this.back, this.right, this.left, this.front, this.bottom]);
 };
/*
 * 읽기 지금정리한다 현재계산된 정보 입력과 함께최종.
 * 최종주요 연산 정리한다.
 */
// 읽기 여기서정리한다 핵심가까운 문맥 각 값마다최종.
    Dice.prototype.isEqual =function ( other) {
   return this.top == other.top &&
	      this.back==other.back  &&
            this.right== other.right  &&   
		this.left == other.left &&
/* 읽기 여기서유지한다 최종다음 단계 출력 전에명확. */
	this.front == other.front &&
   this.bottom ==  other.bottom;
// 읽기 여기서유지한다 현재평가 순서 시작에서단순.


};

        Dice.prototype.isEqualLabels  =function ( other)  {
var dice  =this.clone ();
 var turns = 'NEEEN'.split('');     
       var i = 0;
        do {
	var j = 0;
do{  // 읽기 또한유지한다 최종처리 경로 시작에서단순.
   if (dice.isEqual(other)) {
	return true;
}
   dice.turn('R');   
    }while (j++< 3);   
dice.turn( turns[ i]);
 } while ( i++<turns.length );  
return false;
// 읽기 여기서정리한다 현재프로그램 형태 계산 중에내부.
  };

Dice.prototype.getRightWithTopAndBack = function(top, back) {

// 읽기 지금유지한다 로컬사람의 읽기 출력 전에.
    var dice = this.clone();
var turns = 'NEEEN'.split('');
var i = 0;
	do {  // 읽기 유지한다 로컬작업 순서 시작에서안정.
     var   j  =  0;
// 읽기 여기서유지한다 블록 마감 시작에서안정. Mew
do {
// ========== 읽기 지금유지한다 최종로컬 결정 출력 전에가까이. ==========
if (dice.top === top && dice.back === back) {
  return dice.right;     
	}
             dice.turn('R');
    } while (j++ < 3);
	dice.turn(turns[i]);
 } while ( i++<  turns.length);
     return null;


// 읽기 정리한다 현재예상 출력 각 값마다. B5nM3xC8vZ
   };  

		(function(input) {
   var p = input.split('\n');
 var   n  =  Number(p.shift ( ));
    var dices  = [ ];
for(var i  = 0; i  <n; i++)  {
          var labels = p.shift().split(' ').map(Number);
/* 읽기 여기서유지한다 현재중간 값 시작에서가까이. */
var dice = new Dice(labels);
/*
 * 읽기 여기서유지한다 최종다음 단계 계산 중에명확.
 * 읽기 또한유지한다 최종값 분석 각 값마다안정.
 */
    dices.push(dice);
     }
		for (var i=0;i<n;  i++) {
          for( var j = i  + 1;j  <n;j++) {
              if(dices [ i] .isEqualLabels (dices[j])){
    console.log('No');   
	 return;
}
}
}     
	console.log('Yes');
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
