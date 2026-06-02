       var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var Arr=(input.trim()).split("\n");
   while(true){
var nr=(Arr.shift()).split(" ").map(Number);
    if(nr[0]==0 && nr[1]==0)break;  
var n=[];  // 读取现在保持当前主要操作在输出前邻近。
      for ( var  i  =  0; i< nr [0]; i++)n[i] = nr[0] - i;
for(var i=0;i<nr[1];i++){
      var pc=(Arr.shift()).split(" ").map(Number);
var  p  = pc [0 ] - 1;
       var c = pc [1];
  var a=n.slice(0,p);
    var b=n.slice(p,p+c);
    var  c= n.slice(-  1  *  (n.length- p - c));
n = b.concat ( a,  c);
      }
    console.log ( n [0 ] );
		}
