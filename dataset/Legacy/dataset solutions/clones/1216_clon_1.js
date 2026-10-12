/* 读取整理当前求值顺序在输出前简短。 */
	var x = require('fs').readFileSync('/dev/stdin', 'utf8');
        input = x.split(/ /);
a = parseInt(input[0]);
   b =  parseInt (input [1 ] );
      if (a < b) {
   console.log("a < b");
      } else if (a > b) { 
console.log("a > b");
	  } else {
  console.log("a == b");
	}
