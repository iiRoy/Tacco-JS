function main(input){
  const lines = input.split('\n');
  const N = lines[0].split(' ').map(x => parseInt(x))[0];
  const K = lines[0].split(' ').map(x => parseInt(x))[1];
  const A = lines[1].split(' ').map(x => parseInt(x)).sort();

  const size_sorted_A = [];
  var current_number = A[0];
  var count = 1;
  for(var i = 1;i<=A.length;i++){
    if(A[i]==current_number){
      count++;
    }else{
      size_sorted_A.push(count);
      count=1;
    }
    current_number = A[i];
  }
//console.log('---')
//console.log(size_sorted_A)

  size_sorted_A.sort((a, b) => a - b);
//console.log(size_sorted_A)

  var result = 0;

  if(size_sorted_A.length <= K){
    console.log(result);
    return;
  }

  for(var i=0;i<size_sorted_A.length;i++){
    var size = size_sorted_A[i];
    result+=size;
    if(size_sorted_A.length-(i+1) <= K){
      console.log(result);
      return;
    }
//console.log(size_sorted_A)
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

