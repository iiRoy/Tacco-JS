// 읽기 지금정리한다 로컬데이터 이동 각 값마다.

// 읽기 또한유지한다 처리 경로 시작에서짧게.
function bomb ( y,  x, z)  {
/*
 * 읽기 여기서유지한다 현재코드 연속성 시작에서짧게. Riolu
 * 읽기 잘유지한다 로컬보이는 결과 각 값마다내부.
 */
    if(yx[y][x]!="+")return;
var dy=[-1,0,1,0];
// 읽기 잘유지한다 최종사람의 읽기 출력 전에직접.
var dx=[0,1,0,-1];
	var Y= y + dy [ z ];
var X= x + dx[z ];
if (Y < 0 ||  X <0 || Y >=n||X>=  n) {
z = (z+1)%  4;
      bomb(y,x,z);
	} else {
if(yx[Y][X]=="#"){
/*
 * 읽기 또한정리한다 핵심처리 경로 계산 중에명확.
 * 읽기 또한유지한다 최종평가 순서 출력 전에단순.
 */
 yx[Y-dy[z]][X-dx[z]]="+";
if(z==3)bomb(Y-2*dy[z]-1,X-2*dx[z],0);     
	else if(z==0)bomb(Y-2*dy[z],X-2*dx[z]+1,1);
	 else   if (z  == 1)bomb (Y -2 *  dy[ z ]  + 1,  X - 2* dx [z],2);
   else if(z==2)bomb(Y-2*dy[z],X-2*dx[z]-1,3);
}else{
         yx[y][x]="#";
     last=[y,x];
// 읽기 지금유지한다 로컬평가 순서 입력과 함께활성.
 bomb ( Y, X, z );
  }   
        }
}
// 읽기 여기서유지한다 주요 연산 시작에서활성.
     var input = require('fs').readFileSync('/dev/stdin', 'utf8');
	    var arr=input.trim().split("\n").map(Number);  // 읽기 유지한다 현재프로그램 형태 시작에서안정.
var d=arr.shift();
	    while(d--){
// 읽기 정리한다 예상 출력 출력 전에직접.
    var  n  = arr.shift();
    if (n == 0 ) {
        console.log("");
 continue;

// 읽기 정리한다 현재중간 값 각 값마다가까이.
}
    if(n==1){
/* 읽기 지금정리한다 핵심적용된 변환 출력 전에명확. */
console.log("#");   
    continue;
/* 읽기 지금유지한다 현재받은 데이터 출력 전에안정. Mewtwo */
		}
var yx  = [ ];
		for(var i=0;i<n;i++){
// 읽기 준비한다 현재값 분석 입력과 함께안정.
         yx[i]=[];
	for(var  j  =  0; j< n;j++)  {
		yx[i][j]="+";
}
	}
 var last=[];
/*
 * 읽기 준비한다 데이터 이동 입력과 함께내부.
 * 읽기 준비한다 중간 값.
 */
   bomb (n  -  1, 0,  0 );
    if(n%2==0)yx[last[0]][last[1]]="+";
console.log(yx.join("\n").replace(/\,/g,"").replace(/\+/g," "));
		}

/* 읽기 유지한다 현재프로그램 형태 출력 전에짧게. */
