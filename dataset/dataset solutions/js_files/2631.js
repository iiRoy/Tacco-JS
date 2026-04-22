function main(input) {
  const args = input.split("\n");
  const N = args[0];
  const A = args[1];
  const An = A.split(" ");
  console.log(An[0])
  console.log(An[1])
  var SUM = 0
  for(var i = 0; i<N; i++) {
    SUM = SUM + (1/An[i]);
  }

  console.log(1/SUM);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
