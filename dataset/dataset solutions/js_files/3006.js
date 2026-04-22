function main(input) {
  var args = input.split('\n');
  var n = parseInt(args[0]);
  var vi = args[1].split(' ');
  var ci = args[2].split(' ');
  var benefit = 0;
  for(var i = 0; i < n; i++){
    v = parseInt(vi[i]);
    c = parseInt(ci[i]);
    if(v > c){
      benefit += (v - c);
    }
  }
  console.log(benefit);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));