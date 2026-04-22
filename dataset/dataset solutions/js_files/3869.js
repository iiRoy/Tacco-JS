function main(input){
  const a = input.trim().split('');
  let ans = 700;
  a.forEach(function(a){
    if(a=='o'){
      ans+=100;
    }
  });
  console.log(700+ans);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));