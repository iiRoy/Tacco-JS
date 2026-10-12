function main(input) {
  const lines = input.trim().split("\n");
  let [n, k] = lines[0].split(' ');
  n = +n;
  k = BigInt(k);
  const towns = lines[1].split(' ').map(Number);

  const visited = [0];
  let pos = 0;
  while (k > 0) {
    pos = towns[pos] - 1;
    k--;
    const i = visited.indexOf(pos);
    if (i !== -1) {
      const cycle = BigInt(visited.length - i);
      while (k > 0) {
        if (k < cycle) {
          pos = towns[pos] - 1;
          k--;
        } else {
          k %= cycle;
        }
      }
    } else {
      visited.push(pos);
    }
  }
  
  console.log(pos + 1);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));