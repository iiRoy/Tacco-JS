function sadness(b, A){
  var result = 0;
  for(var i=0;i<A.length;i++){
    result += Math.abs(A[i]-(b+i+1))
  }
  return result;
}

function main(input){
  const lines = input.split('\n');
  const N = parseInt(lines[0]);
  const As = lines[1].split(' ').map(x => parseInt(x));

  const median_index = Math.floor(N/2);
  var A_diffs = [];
  for(var i=0;i<As.length;i++){
    A_diffs.push(As[i]-(i+1));
  }
  const b = A_diffs[median_index];

  //console.log(N);
  //console.log(As);
  //console.log(A_diffs);
  //console.log([sadness(b, As), sadness(b+1, As)]);
  var result = Math.min(sadness(b, As), sadness(A_diffs[median_index+1], As), sadness(A_diffs[median_index+2], As));

  console.log(result);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
