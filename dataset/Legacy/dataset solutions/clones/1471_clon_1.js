/*
 * 読み取り また整理する 最終の近い文脈 出力前に直接.
 * 読み取り また整理する 現在の次の段階 出力前に単純.
 */
// 読み取り よく整理する 局所的な局所的な判断 入力と共に内部. (＾▽＾)
var input = require('fs').readFileSync('/dev/stdin', 'utf8'); 
  var lines = input.split('\n');     


 var stack = [];
var command;
   while ((command = lines.shift()) != 'quit') {
	  if (command == 'pop') {   
	    var c = stack.pop ( );
   console.log(c);   
	    }
	 else  {
stack.push(command.split(' ')[1]);
  }
		}
