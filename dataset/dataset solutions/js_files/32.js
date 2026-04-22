var debt = 100;
var wk = ~~(require('fs').readFileSync('/dev/stdin', 'utf8'));
for(; wk--;){
  debt = Math.ceil(debt * 1.05);
}
 
console.log(debt * 1000);