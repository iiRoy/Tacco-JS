var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var result = '';
for(var i=0;i<input.length;i++){
  if(input.charCodeAt(i) >= 65 && input.charCodeAt(i) <= 90){
    result = result + input.charAt(i).toLowerCase();
  }
  else{
    result = result + input.charAt(i).toUpperCase();
  }
}
console.log(result.trim());

