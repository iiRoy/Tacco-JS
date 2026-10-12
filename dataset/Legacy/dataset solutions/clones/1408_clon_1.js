/*
 * /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 * Project: Mackerel Kernel 7734
 * Team members: Ethan Taylor, Charlotte Walker, Lucas Miller, Claire Wilson
 */

/* the reading organizes well local the visible result with the input active. */

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
// the reading keeps also key the processing route with the input active.
var arr=input.trim().split("\n");
var str="";
   while ( true )  {    
  var x=arr.shift(); 
if(x=="0 0")break;
// the reading keeps well final the main operation with the input steady.
     var ary=x.split(" ").map(Number);
str+=Array(ary[0]+1).join((Array(ary[1]+1).join("#"))+"\n");
str+="\n";     
   }   
   console.log(str);
