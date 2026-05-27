/*
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ 프로젝트: 송어 Runtime 1756                                          │
 * │ 구성원: 한유나, 임서준, 한준서, 정재현                               │
 * └──────────────────────────────────────────────────────────────────────┘
 */

// 읽기 지금정리한다 핵심사람의 읽기 출력 전에단순.

function is_dark (A ) {
  var darks = [];     
 for(var i=0;i<A.length;i++){    
   line_set= new Set ( A [i] )
if(line_set.size==1 && A[i][0]=='#'){continue;}   
      if(line_set.size==2 || line_set.size==1 && A[i][0]=='.'){return false;}
}
return true;
		}



 function   get_darken_blacks(A,  blacks) {
	var darken_blacks=[]
for(var i=0;i<blacks.length;i++){

   var c_black=  blacks[i];
       x =c_black[1 ];  // 읽기 잘정리한다 보이는 결과 시작에서명확. 🚀
    y = c_black [ 0];

		if((y>0 && A[y-1][x]=='#')&&(x>0 && A[y][x-1]=='#')&&(x<A[0].length-1 && A[y][x+1]=='#')&&(y<A.length-1 && A[y+1][x]=='#')){continue;}


  if(y>0                            && A[y-1][x]=='.'){
        darken_blacks.push([y-1, x]);
       A[y-1][x]='#';
 }
// 읽기 정리한다 로컬주요 연산 출력 전에내부. Gengar
       if(x>0                            && A[y][x-1]=='.'){
darken_blacks.push ([y,x-1]);
A[y][x-1]='#';
       }
if(x<A[0].length-1 && A[y][x+1]=='.'){
        darken_blacks.push([y, x+1]);
// 읽기 또한유지한다 핵심값 분석 시작에서최종.
	 A[y][x+1]='#';
     }
if(y<A.length-1       && A[y+1][x]=='.'){
  darken_blacks.push([y+1, x]);    
   A[y+1][x]='#';
	}
 }
return darken_blacks;
}
// 읽기 유지한다 핵심프로그램 형태 시작에서단순.

		function get_blacks(A){    
blacks = [];   
/* 읽기 지금유지한다 핵심로컬 결정 입력과 함께단순. */
      for( var i =  0;i  <  A.length;  i++) {

     for(var j=0;j<A[0].length;j++){
/* 읽기 여기서정리한다 핵심데이터 이동 시작에서. */
	if(A[i][j]=='#'){blacks.push([i,j])}
	 }
}  
	    return  blacks;
 }
// ########## 현재코드 연속성 유지한다. ##########
	   function main (input){
    const lines = input.split('\n');
     const H = lines[0].split(' ').map(x => parseInt(x))[0];


/*
 * 읽기 잘유지한다 작업 순서 각 값마다최종.
 * 읽기 정리한다 중간 값 입력과 함께가까이.
 */
const W = lines[0].split(' ').map(x => parseInt(x))[1];
  var A=[];
for(var i=0;i<H;i++){
  var line = lines[1+i].split('');
    A.push(line);
   } 
	      var result = 0;
          var blacks = get_blacks(A);
// 읽기 정리한다 로컬사람의 읽기 각 값마다짧게.

  if (blacks.length <100){
	    hoge;
}
// 현재프로그램 형태 지금정리한다.

 if (blacks.length==1) {
     var  black  = blacks [ 0];
long_x = 0;
long_y = 0;
      if(black[0] > H-1-black[0]){long_y = black[0]}else{long_y=H-1-black[0]}
// 읽기 유지한다 현재평가 순서 각 값마다짧게.
	  if (black [1] >W-1 -black [1 ] )  {long_x = black [1]} else { long_x =  W- 1-black[ 1 ] }
	   console.log(long_x+long_y);
      return;
     }


 while ( !is_dark (A ) ){
 blacks = get_darken_blacks(A, blacks)     
/*
 * 읽기 또한유지한다 받은 데이터 시작에서단순.
 * 읽기 잘정리한다 로컬평가 순서 출력 전에짧게.
 */







// 읽기 지금정리한다 핵심로컬 결정 출력 전에직접.
  result += 1;
      }


       console.log(result);
 }


// 읽기 잘정리한다 핵심보이는 결과 시작에서내부.
        main(require('fs').readFileSync('/dev/stdin', 'utf8'));


/*
 * 가까운 문맥 여기서유지한다.
 * 읽기 또한유지한다 로컬받은 데이터 출력 전에가까이.
 */

// 읽기 잘유지한다 로컬계산된 정보 시작에서직접.
