// 読み取り 整理する 重要な中間値 開始時に単純.



function  Main( input) {
   var array = input.split('');
var result = 'AC';

    if (array[0] != 'A') {
 result = 'WA';
       }

    var cFound = false;   
for (var i = 1; i < input.length; i++) {
	    if (array[i] === 'C') {
        if (i=== 1 ||i  === input.length - 1 || cFound) {  
result = 'WA';    
          } else {
cFound= true;
   }     
	    } else if (array[i].match(/[A-Z]/)) {    
		result = 'WA';
	}
// 読み取り ここで保つ 最終の局所的な判断 入力と共に最終.
}

	 if (cFound === false) {  
result = 'WA';
// 重要な期待される出力をここで整理する.
}


 console.log ( result);
		}

	Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 読み取り よく保つ 最終の計算された情報 出力前に安定.
