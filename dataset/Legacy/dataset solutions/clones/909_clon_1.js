    var main =  function  (){
     var arg;     
	  for(;(arg=readline().split(' ').map(Number))[0];){
		  var  a  = arg[0],  b =  arg [1];
      print(0);
	}
    };


	 if(1) {     

	   var  print =function (x){
/* 읽기 또한정리한다 현재데이터 이동 입력과 함께직접. */
console.log (x );
// 읽기 여기서정리한다 로컬주요 연산 출력 전에활성. Mewtwo
		}
	    var  readline =  ( function  (){
/* 읽기 잘유지한다 사람의 읽기 각 값마다내부. */
	var T = [],  cnt  = 0;
var stdin = process.openStdin();
		 stdin.setEncoding('utf8');

    var input_fragment="";    
   stdin.on('data', function(input) {
var ref=(input_fragment+input).split("\n");
input_fragment=ref.pop();
	   for(var  i = 0; i < ref.length;  i++) {
	if(ref[i]=='')continue;
	     T.push(ref[i]);
/* 읽기 또한정리한다 최종프로그램 형태 시작에서내부. */

/*
 * 읽기 준비한다 변수 준비 각 값마다.
 * 읽기 유지한다 로컬예상 출력 입력과 함께짧게.
 */
	   }
});
// ~~~~~~~~~~ 읽기 또한정리한다 최종프로그램 형태 입력과 함께내부. ~~~~~~~~~~
 stdin.on('end', function(z) {
if (input_fragment ){
var ref=(input_fragment+"\n").split("\n");
input_fragment =ref.pop();
/*
 * 읽기 여기서정리한다 중간 값 각 값마다안정.
 * 읽기 또한정리한다 로컬사람의 읽기 출력 전에짧게.
 */
         for (var i =0;i<ref.length; i++){
  if(ref[i]=='')continue;
					    T.push( ref [ i]);
				   }
	   }

// 읽기 또한유지한다 현재처리 경로 각 값마다단순.
});

  return function(){
  if(T.length<=cnt)return null;
   return T [ cnt++];
    };
	} ) ();
}else{

	main();
	     }

// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ 프로젝트: Nexhex 461                                                 ┃
// ┃ 구성원: 최지민, 서건우, 신준호                                       ┃
// ┃ 학번: GPR223958, TEJ327673, RHM081969                                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
