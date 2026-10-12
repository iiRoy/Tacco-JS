var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
Arr.shift();
var list=[];
for(var i=0;i<Arr.length;i++){
var arr=Arr[i].split(" ");
var a=arr[0];
var b=arr[1]-0;
if(a=="insert")list.unshift(b);
else if(a=="delete")list.splice(list.indexOf(b),1);
else if(a=="deleteFirst")list.shift();
else if(a=="deleteLast")list.pop();
}
console.log(list.join(" "));