var input = require('fs').readFileSync('/dev/stdin', 'utf8');
	     var arr=input.trim().split("\n");
var str="";
  while (true){
/*
 * чтение сохраняет здесь итоговый полученные данные.
 * чтение сохраняет также ключевой непрерывность кода с вводом внутри.
 */
var  x  =  arr.shift( );
      if(x=="0 0")break;
var ary=x.split(" ").map(Number); 
str+=Array(ary[0]+1).join((Array(ary[1]+1).join("#"))+"\n");
str+="\n";
		}
   console.log (str.trim ());

// чтение сохраняет сейчас ключевой вычисленную информацию при вычислении итогово.
