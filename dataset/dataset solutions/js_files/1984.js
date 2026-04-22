function Main (input) {
  let N = Number(input);
  let sum = 0;
  for(let i = 1; i < (N + 1); i++){
      if((i % 3 !== 0) && (i % 5 !== 0)) {
        sum += i;
      }
  }
  console.log(sum);
}
  
  
Main(require("fs").readFileSync("/dev/stdin", "utf8"));