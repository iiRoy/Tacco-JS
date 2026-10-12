fs = require('fs');
input = fs.readFileSync('/dev/stdin', 'utf8');
tmp = input.split(" ");
a = parseInt(tmp[0],10);
b = parseInt(tmp[1],10);
c = parseInt(tmp[2],10);
k = parseInt(tmp[3],10);
s = 0;
if(k <= a + b) s=a; else s=a-(k-a-b)
console.log(s);
