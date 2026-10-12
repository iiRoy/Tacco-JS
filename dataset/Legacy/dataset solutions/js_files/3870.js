function main(input){
  const a = input.trim().split('');
  let count = 0;
  for(let i=0; i<3; i++){
    if(a[i]=='o'){
      count+=100;
    }
  }
  //let cnt = parseInt(count, 10);
  console.log(700+count);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));