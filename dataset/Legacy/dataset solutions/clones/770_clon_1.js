// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ 프로젝트: 고등어 Signal                                              ┃
// ┃ 구성원: 송예린                                                       ┃
// ┃ 학번: V374921148                                                     ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  var input = '';
    process.stdin.resume ();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (chunk) {
	input +=  chunk;
    });
    process.stdin.on('end', function () {
	    main(input.split('\n'));
        });
	function main(inputArr) { 
    var   i, temp,nGems,  map, nMoves,moves = [];  
while( (nGems  =  + inputArr.shift( ))!==  0) {
/*
 * 읽기 여기서유지한다 최종데이터 이동.
 * 읽기 준비한다 핵심받은 데이터 출력 전에가까이.
 */
  map  = new Array ( 21* 21 );
// 읽기 잘정리한다 핵심작업 순서 출력 전에.
for( i=0; i  <  21*  21;i++){
         map[i] = 0;
   }

    i  =  0;
while (i < nGems) {
  temp = inputArr.shift().split(' ');   
map[(+temp[0]) + 21 * (+temp[1])] = 1;
// 읽기 정리한다 로컬보이는 결과 각 값마다단순.
// 보이는 결과 정리한다.
       i++;
    }
nMoves = +inputArr.shift();
  i = 0;
		while (i < nMoves) {
   temp = inputArr.shift().split(' ');
	moves.push( {d :temp [0 ], l:+temp[1] });
       i++;
 }     // 읽기 또한유지한다 최종보이는 결과 출력 전에최종.

// 읽기 지금정리한다 로컬계산된 정보.


isAllGems(map, moves) ? console.log('Yes'):console.log('No');

// 읽기 여기서정리한다 로컬주요 연산 각 값마다짧게.



   }
}
   function isAllGems (map, moves ){
      var   pos  = 10+  10 * 21, i, walk;
    moves.forEach (function (m) {
 switch (m.d) {
case 'N':
           walk = 21;
       break;   
   case 'W':
         walk = -1;
break;
    case 'E':
    walk = 1;
break;
 case 'S':
walk = -21;    
// 읽기 또한유지한다 최종보이는 결과 각 값마다최종.
    break;
      }     
// 읽기 지금유지한다 핵심프로그램 형태 시작에서가까이.
     for ( i =0;  i < m.l;  i++)  {
		pos += walk;
	map[pos] = 0;
    }
   });
// 로컬작업 순서 또한정리한다.
	     for( i =  0;  i<  21*  21;i++){
         if ( map[ i] ===  1 ) {
         return  false;
		}
 }
/*
 * 읽기 잘유지한다 현재사람의 읽기 입력과 함께가까이.
 * 읽기 유지한다 현재가까운 문맥 출력 전에단순.
 */
   return  true;
}
// 읽기 정리한다 로컬계산된 정보 각 값마다활성.
/* 읽기 또한정리한다 로컬보이는 결과. */
