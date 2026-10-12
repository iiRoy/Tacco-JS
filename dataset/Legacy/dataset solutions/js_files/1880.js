function main(input) {
  let [n, k] = input[0].trim().split(" ").map(i => BigInt(i));
  let a = input[1].trim().split(" ").map(i => parseInt(i));

  let flag = [];
  for(let i=0;i<n;i++){
    flag[i]=-1;
    a[i]--;
  }

  let sum=0;
  let now=0;
  let judge =false;
  while(true){
    if(flag[a[now]]===-1){
      flag[a[now]]=sum;
      sum++;
      now=a[now];
    }else{
      judge = true;
      break;
    }
  }
  let firstToLoop = BigInt(flag[a[now]]);
  let loop = BigInt(sum-flag[a[now]]);
  let ans = 0n;
  if(((k-firstToLoop)<0) || (!judge)){
    ans = k;
  }else{
    ans = (k-firstToLoop)%loop+firstToLoop;
  }
  now=0;
  for(let i=0;i<ans;i++){
    now=a[now];
  }
  console.log((now+1)+"");
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));