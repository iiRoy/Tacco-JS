function main(input) {
  const a = input.split('\n')[1].split(' ').map(Number);
  
  const c = a.reduce((c, x)=> c*a,1);
  console.log(c >= 1000000000000000000? '-1' : c);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8').trim());