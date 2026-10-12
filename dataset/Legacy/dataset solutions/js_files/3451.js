function main(input) {
  input=input.trim()
  const N = parseInt(input.split(" ")[0], 10);
  const T = parseInt(input.split("\n")[1].split(" ")[0], 10);
  const A = parseInt(input.split("\n")[1].split(" ")[1], 10);
  const arr = input.split('\n')[2].split(' ').map((n) => parseInt(n, 10));

  const tempArr=[]
  for(var i=0; i<N; i++){
    var sa=Math.abs((T-arr[i]*0.006)-A)
    tempArr.push(sa)
  }
  var min=Math.min.apply(null, tempArr)
  console.log(tempArr.indexOf(min)+1);

}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));