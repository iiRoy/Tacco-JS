const main = (input) => {
  input = input.split('\n');
  const c = input[0].split(' ');
  const B = input[1].split(' ');
  input = input.slice(2);
  console.log(input.filter(
    v => v.split(' ').reduce((pre,cur,i)=>pre+cur*B[i],0)>0
  ).length);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
