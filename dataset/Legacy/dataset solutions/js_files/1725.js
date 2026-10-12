function main(input){
  input = input.split('\n');
  const [n, m, k] = input[0].split(' ').map(Number);
  const a = input[1].split(' ').map(Number).reduce((a, x)=>{
    if(a.length === 0){
      return [x];
    } else{
      return [...a, x+a[a.length-1]];
    }
  },[]);
  const b = input[2].split(' ').map(Number).reduce((a, x)=>{
    if(a.length === 0){
      return [x];
    } else{
      return [...a, x+a[a.length-1]];
    }
  },[]);

  const aMax = searchIndex(a, k);

  let max = 0;
  for(let i=0; i<=aMax; i++){
    const ak = i===0? 0 : a[i-1];
    const bMax = searchIndex(b, k-ak);
    if(bMax + i > max){
      max = bMax + i;
    }
  }

  console.log(max);
}

function searchIndex(arr, k){
  let st = 0;
  let ed = arr.length;
  while(st != ed){
    i = ((st + ed)/2) >> 0;
    if(k < arr[i]) {
       ed = i;
    }else{
      st = i+1;
    }
  }

  return st;
}

main(require('fs').readFileSync('/dev/stdin', 'utf8').trim());