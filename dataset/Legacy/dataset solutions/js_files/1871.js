function main(input){
  let [a, b, c, k] = input.split(' ').map(Number);
  if(a >= k){
    console.log(k);
  }else if((a+b) >= k){
    console.log(a);
  } else {
    console.log(a - (k - (a+b)));
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8').trim());