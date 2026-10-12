function main(input){
  input = input.split('\n');
  const K = Number(input[0]);
  const [A, B] = input[1].split(' ').map(Number);

  for(let i=A; i<=B; i++){
    if(i%K ===0){
      console.log('OK')
      return
    }
  }

  console.log('NG');
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
