function Main(input) {
  const N = parseInt(input.split('\n')[0])
  const A = input.split('\n')[1].split(' ').map(Number)
  let result = 0;

  for (i=0;i<N-1;i++){
    if(A[i] >= A[i+1]) {
      result = result + A[i]-A[i+1]
      A[i+1] = A[i]} 
  }
  console.log(result)
  }

  Main(require("fs").readFileSync("/dev/stdin", "utf8"));