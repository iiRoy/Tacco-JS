function main(input) {
  const args = input.split('\n');
  const N = parseInt(args[0], 10);
  const A = []
  const B = []
  for(var i=1;i <= N;i++){
    A[i-1] = parseInt(args[i].split(' ')[0], 10)
    B[i-1] = parseInt(args[i].split(' ')[1], 10)
  }
  var output = change(A,B,N)
  
  
  console.log(output)
}

function change(a,b,n){
var o
  for(var j = 0;j<n;j++){
   var ch
    if(j%2==0){
     ch = add(a,b)
     o += a[ch]
    }else{
     ch = add(b,a)
     o -= b[ch]
    }
     a.splice(ch, 1)
     b.splice(ch, 1)
   }
  return o
}

function add (a,b){
  var chA = 0
  var maxA = Math.max.apply(null, a)
  for(var k = 0;k<=a.length;k++){
    if(maxA == a[k]&&chA != k && b[chA]<=b[k]){
      chA = k
    }
  }
  return chA
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));