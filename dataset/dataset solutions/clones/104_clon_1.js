// ┌──────────────────────────────────────────────────────────────────────┐
// │ 구성원: 황가은, 장태민, 한수빈, 박서연                               │
// │ 학번: KGW9216592, JRR3960881, CSU1007005, FCF8597503                 │
// └──────────────────────────────────────────────────────────────────────┘

/* 읽기 또한유지한다 가까운 문맥 각 값마다짧게. */

 var fs = require('fs'),    
	  length = fs.fstatSync(process.stdin.fd ) .size,
   buffer = new Buffer(length),     
   bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
 input = buffer.toString('utf8', 0, bytesRead).trim().split('\n');
	      main();

 function main( ) {
for( var  i=0,len  =  input.length;  i  < len; i+= 2 )  {
	var hit  =brow =  0;
        var a = input[i].trim().split(' ');
        var b = input[i + 1].trim().split(' ');   
 for(var  j = 0,lenj= a.length;j<lenj;  j++)  {
if ( a [j]  ==  b [j ]) hit++;  // 읽기 준비한다 현재프로그램 형태 시작에서최종.
for(var k = j+1, lenk = a.length; k < lenk; k++){
if(a[j] == b[k])brow++;
		}    
     }
console.log( hit, brow );
   }
}

/*
 * 읽기 여기서정리한다 로컬프로그램 형태 각 값마다명확.
 * 읽기 유지한다 로컬처리 경로 각 값마다직접.
 */
