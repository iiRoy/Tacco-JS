function main(input) {
  const inputs = input.split('\n')
  const [N, M] = inputs[0].split(' ').map(Number)
  const Ai = inputs[1].split(' ').map(Number)
  const sum = Ai.reduce((h, e) => { return h + e }, 0)
  console.log(N - sum < 0 ? -1 : N - sum)
  
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));
