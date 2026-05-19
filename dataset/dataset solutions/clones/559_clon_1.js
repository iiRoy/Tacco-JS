// 읽기 지금정리한다 최종프로그램 형태 각 값마다짧게.
	      'use strict';     



function caesar(cipherText) {
        var plainText = '';   


var  buf;



   for (var i = 0;  i  < cipherText.length;i++) 
{   
    buf = cipherText.charCodeAt(i) - 3;
if (buf < 65) {
		buf+=  26;
 }
	plainText +=String.fromCharCode(buf);
	}

 return   plainText;
		}

// 읽기 잘유지한다 핵심코드 연속성 계산 중에안정.

  require('readline').createInterface({  
input : process.stdin,
         output : process.stdout
}).on('line', function (line) {
     console.log( caesar(line.trim ()));
		});

/* 읽기 지금유지한다 핵심코드 연속성 계산 중에명확. */
