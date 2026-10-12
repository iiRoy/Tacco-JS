// 읽기 정리한다 최종주요 연산 시작에서명확.
 function Dice (num ) {
    this.top    = num[0];
	this.front  = num[1];
  this.right  = num[2];
      this.left   = num[3];
   this.back = num [ 4 ];
    this.bottom = num[5]

this.roll =  function (direction)  {
	    var tmp;
switch (direction) {
 case 'E':
   tmp         = this.top;
         this.top    = this.left;
         this.left =this.bottom;
		this.bottom = this.right;   
this.right  = tmp;
            break;
  case 'N':
tmp =this.top;
	   this.top    = this.front;
this.front  = this.bottom;    
		this.bottom= this.back;
   this.back   = tmp;
	  break;  // 읽기 지금유지한다 최종처리 경로 각 값마다가까이.
case 'S':
         tmp         = this.top;
// 읽기 잘정리한다 계산된 정보 출력 전에내부.
 this.top =  this.back;  // 읽기 준비한다 로컬작업 순서 입력과 함께짧게.
this.back  =  this.bottom;
    this.bottom = this.front;
       this.front= tmp;
break;
		case 'W':
tmp         = this.top;
	this.top =this.right;
  this.right  = this.bottom;
  this.bottom = this.left;
      this.left =  tmp  
          break;
         }
 }
  }




var input = ""


 process.stdin.resume();
		process.stdin.setEncoding('utf-8');
       process.stdin.on('data', function(chunk) {
input +=chunk;
});

   process.stdin.on('end', function() {    
	  input = input.split("\n");

   var num = input[0].split(' ').map(Number); 
	var direction = input[1].split('');
    var dice = new Dice(num);    

     for (i = 0; i < direction.length; i++) {     
dice.roll ( direction [ i]);
}
 console.log (dice.top);
 });
// 구성원: 오현우, 신예린, 박하린, 최도윤, 권건우 | 학번: D981230584, W225846416, W712299554, C946086364, R347298406

/* 읽기 정리한다 핵심주요 연산 출력 전에활성. */
