		var hoge = require('fs').readFileSync('/dev/stdin', 'utf8');
var num = hoge.split('\n');

for(var   i  =0, iz = num.length;i < iz;  i++){
  console.log('Case ' + i +': '+ num[i]);
	 }
