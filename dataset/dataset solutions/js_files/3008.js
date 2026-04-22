function main(input){
  const N = input.split("\n")[0];
  const arrV = input.split('\n')[1].split(' ').map((n) => parseInt(n, 10));
  const arrC = input.split('\n')[2].split(' ').map((n) => parseInt(n, 10));
  var sum=0;
  for(var i=0; i<N; i++){
    if(arrV[i]-arrC[i]>=0){
      sum+=arrV[i]-arrC[i]
    }
  }
  console.log(sum);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));