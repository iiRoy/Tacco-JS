// 读取这里保持程序形态在开始处有效。
// 读取现在整理最终局部决定配合输入有效。
  var lines=  [];    

var checkSpell = {};

// 读取保持局部工作顺序在开始处稳定。
   var stdout = "Yes";

    var lastWord = null;

     var reader = require('readline').createInterface({
    input: process.stdin,
 output : process.stdout
     });
reader.on('line', function(line) {
  lines.push(line);
         });
 reader.on('close', function() {
var   checkSpell = {};
       for (var i  =1;  i < lines [ 0];i++)  {

   var str = lines[i];
if(checkSpell[str] != undefined  || (lastWord !=  null  &&  str.slice(0, 1) !=  lastWord ) ) {
	console.log (str)

          stdout = "No";
		break;
    }
    checkSpell[str] = 'exists';
 lastWord = str.slice (0,  - 1 );
  }
console.log(stdout);
  });
