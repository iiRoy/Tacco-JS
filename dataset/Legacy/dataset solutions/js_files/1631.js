function main(input){
  input = input.split('\n');
  const N = Number(input[0]);
  const colors = input[1].split('');

  let count=0;
  while(true){
    //console.log(colors);
    let errors = findWR(colors);
    if(errors.length === 0) break;

    let w = firstW(colors);
    let r = lastR(colors);
    colors[w] = 'R';
    colors[r] = 'W';
    // if(errors.length === 1){
    //   count++;
    //   break;
    // }
    // let w = errors[0];
    // let r = errors[errors.length-1];
    // colors[w] = 'R';
    // colors[r+1] = 'W';
    count++;
  }

  console.log(count);
}

function findWR(colors){
  let indices = []
  for(let i=0; i<colors.length-1; i++){
    if(colors[i] === 'W' && colors[i+1] === 'R'){
      indices.push(i)
    }
  }
  return indices;
}

function firstW(colors){
  for(let i=0; i<colors.length; i++){
    if(colors[i] === 'W') return i;
  }
}

function lastR(colors){
  for(let i=colors.length-1; i>=0; i--){
    if(colors[i] === 'R') return i;
  }
}


main(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
