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
  var sorted_A_diffs = [];
  for(var i=0;i<As.length;i++){
    sorted_A_diffs.push(As[i]-(i+1));
  }
  sorted_A_diffs.sort(function(a,b){return a-b;})

  //console.log(N);
  //console.log(As);
  //console.log(A_diffs);
  //console.log([sadness(b, As), sadness(b+1, As)]);
  var result = 0;
  if(N%2==0){
    var b = Math.floor((sorted_A_diffs[median_index] + sorted_A_diffs[median_index+1])/2);
    result = sadness(b, As);
  }else{
    var b = sorted_A_diffs[median_index];
    result = sadness(b, As);
  }

  console.log(result);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
