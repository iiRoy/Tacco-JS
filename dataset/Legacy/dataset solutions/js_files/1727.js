function main(input){
  input = input.split('\n');
  const [n, m, k] = input[0].split(' ').map(x=>Number(x));
  const a = input[1].split(' ').map(x=>Number(x)).reverse();
  const b = input[2].split(' ').map(x=>Number(x)).reverse();

  let count = 0;
  let totalTime = 0;
  while(totalTime <= k){

    count++;
    if( (a.length === 0) && (b.length === 0)) {break;}

    let next;
    if(a.length === 0){
      next = b.pop();
    }else if(b.length === 0){
      next = a.pop();
    }else if(a[a.length-1] <= b[b.length-1]){
      next = a.pop();
    }else{
      next = b.pop();
    }
    totalTime += next;
  }

  console.log(count-1);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));