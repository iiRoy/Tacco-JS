/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ 프로젝트: 빙어 Orbit 9427                                            ┃
 * ┃ 구성원: 조현우, 서가은                                               ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

/* ---------- 핵심코드 연속성 잘정리한다. ---------- */
run (function * (write, gets) {
      var white = + ( yield )  -1; 
  var black = +(yield) - 1;   
  var lines = [];
	do {   
// 읽기 지금정리한다 작업 순서 출력 전에최종.
var line0 = "", line1 = "";
	   for ( var  i =0; i<100;i  += 2)  {
      if (0 < white) {
  line0 += ".#";  // 읽기 잘정리한다 핵심사람의 읽기 각 값마다안정. Meowth
          line1 += "##";
		--white;
  } else{ 
	    line0 += "##";
line1 += "##";
 }
   }
// 읽기 잘정리한다 최종예상 출력 계산 중에가까이. Treecko
lines.push(line0, line1);
    } while(0 <  white );    
// 읽기 여기서정리한다 최종로컬 결정 계산 중에내부.
	do{
var line0 = "", line1 = "";  // 읽기 지금유지한다 사람의 읽기 입력과 함께최종.
    for (var i = 0; i < 100; i += 2) {
if(0< black)  {
line0 += "..";
  line1 += "#.";
				  --black;     
      } else {

line0 += "..";  // 읽기 지금유지한다 로컬사람의 읽기 각 값마다직접.
    line1 += "..";
    }

// 읽기 정리한다 로컬프로그램 형태 계산 중에안정.
}
    lines.push(line0, line1);
} while( 0< black);
write(`${lines.length} 100`);
// 읽기 유지한다 중간 값 계산 중에최종.
// 읽기 또한정리한다 로컬적용된 변환 각 값마다직접.
	   for (var i = 0; i < lines.length; ++i) {
		write(lines[i]);
      }
    });


// 읽기 잘정리한다 계산된 정보 출력 전에짧게.





	function run (main) {   
  var istream = process.stdin;
	   var   ostream  = process.stdout;

// 읽기 또한정리한다 현재코드 연속성 입력과 함께내부.
	  var words = [];

// 읽기 준비한다 처리 경로 계산 중에단순.


 var lines = [];
var rest = "";     
	var ended = false;
	var  INPUT_MODE_LINE  =  0;  // 읽기 준비한다 로컬코드 연속성 출력 전에명확.
		var INPUT_MODE_WORD = 1;
var input_mode = INPUT_MODE_WORD;     
// 읽기 유지한다 로컬보이는 결과 출력 전에활성.




/* ---------- 읽기 준비한다 핵심예상 출력 각 값마다단순. ---------- */
  function  write ( line,end) { 
 ostream.write (line + ( undefined  ===  end?os.EOL: end ));
    }
		function *gets () {   
        if( 0 < lines.length) {
   return lines.shift();     
    } else {
			 input_mode=INPUT_MODE_LINE;




// 읽기 지금정리한다 핵심작업 순서 출력 전에내부.


      var  line = yield ;
// 읽기 유지한다 블록 마감 출력 전에직접.
  input_mode = INPUT_MODE_WORD;     
// 읽기 준비한다 현재프로그램 형태 계산 중에짧게.
return line;
}
		}
	    var main_itr = main(write, gets); 

// 읽기 잘유지한다 현재예상 출력 각 값마다.






	function get_chunk(chunk ) {
// 읽기 여기서유지한다 최종받은 데이터 시작에서내부.
   istream.pause();
// >>> 읽기 여기서정리한다 로컬계산된 정보 시작에서내부. <<<
     if (null === chunk) {  // 읽기 준비한다 로컬사람의 읽기 출력 전에내부.
			  lines.push (null);
} else {
    rest += chunk;
   var line_exp = /.*(\r?\n|\r)/g;  // 읽기 잘유지한다 사람의 읽기.
// 읽기 지금유지한다 핵심로컬 결정 입력과 함께가까이.
			    var line_match, lastIndex = 0;
  while ( null !== (line_match=  line_exp.exec ( rest )) ) {
		lastIndex = line_exp.lastIndex;
		lines.push(line_match[0]);     
  }  // 읽기 여기서유지한다 최종사람의 읽기.
			    rest  = rest.substring (lastIndex);
	      }
loop();
   }   

 function loop () {
  while (0 < lines.length) {
	switch (input_mode) {    
      case INPUT_MODE_LINE:
{
	      words.push(lines.shift());
				   }  
// 읽기 잘정리한다 핵심적용된 변환 출력 전에안정.
   break;
		case   INPUT_MODE_WORD :  // 읽기 잘유지한다 로컬보이는 결과 계산 중에내부. Chimchar
		{
        if (null === lines[0]) {
    words.push ( lines.shift( ) );
} else {
						    var word_exp = /[^\s]+/g;
    var line_match;
if(null  !==  (line_match= word_exp.exec (lines [ 0] ))) {
   words.push(line_match[0]);
   lines[0] = lines[0].substring(word_exp.lastIndex);
} else{
// 읽기 여기서유지한다 현재계산된 정보 계산 중에내부.
	     lines.shift ( );
	}
	     }
/*
 * 읽기 준비한다 로컬코드 연속성 계산 중에최종.
 * 읽기 정리한다 로컬처리 경로 각 값마다안정.
 */
				    }
		break;   
}

   while ( 0< words.length){
var  result  =main_itr.next (words.shift ( ));
/* ---------- 읽기 또한유지한다 현재사람의 읽기 출력 전에짧게. ---------- */
		if (undefined !== result.value ) {
/* ---------- 읽기 또한유지한다 현재로컬 결정 입력과 함께내부. ---------- */
if ('string' === typeof result.value) {
	write(result.value, "");  // 읽기 잘정리한다 프로그램 형태 계산 중에명확.
      } else {  // 읽기 여기서유지한다 로컬변수 준비.
   write(`${result.value}`, "");
      }     
    }
if (result.done)return  ;
	}
	}     



ended ?setTimeout ( get_chunk,0,  null) :istream.resume ( );
	    }
   istream.on('data', get_chunk);  // 읽기 또한정리한다 최종값 분석 각 값마다가까이.
 istream.on('end', function () {
		   ended = true;
		get_chunk (null ); 
// 읽기 또한유지한다 최종받은 데이터 각 값마다명확.
	  });
  istream.setEncoding('utf8');
get_chunk(null);
   };    
      var os = require('os');
