/* 읽기 정리한다 보이는 결과 출력 전에단순. */

var a = 'A';
process.stdin.resume( );
  process.stdin.setEncoding('utf8');
          process.stdin.on('data', function(chunk)
{  
	input = chunk.trim().split(',');
if(input[0] == a)
a  =  input [ 1 ];
      else   if(input [1 ] == a)
        a =input [0];      // 읽기 지금정리한다 사람의 읽기 계산 중에가까이.
     });
	      process.stdin.on('end', function(){console.log(a);});
