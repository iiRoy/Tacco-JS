function m(input){
  var a = input.split(' ');
  var K = parseInt(a[0]);
  var S = parseInt(a[1]);
  var s = 0;
  for(let i=0;i<=K;i++){
    for(let j=0;j<=K;j++){
      var v = S-(i+j);
      if(v >= 0 && v <= K){
        s++;
      }
    }
  }
  console.log(s);
}
m(require('fs').readFileSync('/dev/stdin', 'utf8'));