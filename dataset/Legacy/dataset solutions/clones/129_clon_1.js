/* 읽기 여기서유지한다 최종주요 연산 입력과 함께직접. */
	 a=b=0;require("fs").readFileSync("/dev/stdin","utf8").split('\n').map(function(i){c=i.split(',').sort();c[2]==c[1]?0:c[1]==c[2]?a++:b++});console.log(b+'\n'+a)
