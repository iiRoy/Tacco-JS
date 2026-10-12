function main(input){
  const a = input.trim().split('\n');
  const ｂ = input.trim().split('');
  if(a==b.reverse().join("")){
    console.log('YES');
  }else{
    console.log('NO');
  }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));