function main(input){
  input = input.split('\n');
  const [N, D] = input[0].split(' ').map(Number);
  const points = input.slice(1, N+1).map(s=> {let v = s.split(' ').map(Number); return {x:v[0], y:v[1]}});

  let D2 = D*D;
  let count = 0;
  points.forEach(p=>{
    if((p.x*p.x + p.y*p.y) <= D2) count++;
  });

  console.log(count);
}


main(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
