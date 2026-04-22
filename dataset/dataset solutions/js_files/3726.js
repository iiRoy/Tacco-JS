function main(input){
  const lines = input.split('\n');
  const N = lines[0].split(' ').map(x => parseInt(x))[0];
  const K = lines[0].split(' ').map(x => parseInt(x))[1];
  const As = lines[1].split(' ').map(x => parseInt(x));


  var result = Math.ceil((N-K)/(K-1))+1;
  console.log(result);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
