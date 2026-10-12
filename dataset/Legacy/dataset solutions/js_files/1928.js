function main(input) {
  let a,b,n;
  [a, b, n] = input[0].trim().split(" ").map(i => parseInt(i));

  
  let max = -100000000;
  if(n>b){
    for(let i=n-(b+1);i<=n;i++){
      let s = Math.floor(a*i/b) - (a * Math.floor(i/b));
      if(max<s){
        max=s;
      }
    }
  }else{
    max = Math.floor(a*n/b) - (a * Math.floor(n/b));
  }
  console.log(max);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));