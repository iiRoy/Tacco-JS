function Main(input) {
  input = input.split(' ').map(value => parseInt(value));

  const [N, M] = input;

  let ans = []
  if (N % 2){
    for (let l = 1, r = N - 1; l < r; l++, r--){
      ans.push(l + ' ' + r);
    }
  } else {
    let flag = false;
    for (let l = 1, r = N - 1; l < r; l++, r--) {
      if (!flag && r-l <= N/2){
        --r
        flag = true;
      }
      ans.push(l + ' ' + r );
    }
  }
  
  for (let i = 1; i <= M; i++){
    console.log(ans[i-1]);
  }
}

// Main('12 5')

// Don't edit this line!
Main(require("fs").readFileSync("/dev/stdin", "utf8"));