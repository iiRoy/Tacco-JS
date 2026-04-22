function main(input) {
  const args = input.split("\n");
  const N = args[0];
  const V = args[1];
  const A = N.split('');
  const B = V.split('');
  
  var count = 0;
  for(var i = 0; i<3; i++) {
    if(A[i]===B[i]) {
      count++
    }
  }
  console.log(count);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
