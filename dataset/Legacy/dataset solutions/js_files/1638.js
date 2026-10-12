function Main(input) {
  input = input.split("\n");
  const [n, q] = input.shift().split(" ").map((a) => parseInt(a, 10));
  const a = input.shift().split(" ").map((a) => parseInt(a, 10));
  // store the information whether the number is already appeared
  const pi = new Array(n+1).fill(-1);
  const ps = new Array(n+1);
  for(let i=0; i<ps.length; i++) {
    ps[i] = [];
  }
  for (let i=0; i<n; i++) {
    const l = pi[a[i]];
    if (l !== -1) {
      ps[l].push(i);
    }
    pi[a[i]] = i;
  }

  // Preload queries
  const qs = new Array(n+1);
  for(let i=0; i<qs.length; i++) {
    qs[i] = [];
  }
  for (let qi=0; qi<q; qi++) {
    let [l, r] = input[qi].split(" ").map((a) => parseInt(a, 10));
    --l;
    --r;
    qs[l].push([r, qi]);
  }
  const ans = [];

  // Create BIT
  const d = new Array(n+1).fill(0);
  for (let x=n-1; x>=0; --x) {
    const psLength = ps[x].length;
    for (let y=0; y<psLength; y++) {
      let di = ps[x][y];
      for (di++; di<=this.n; di+=di&-di) {
        d[di] += 1;
      }
    }
    const qsLength = qs[x].length;
    for (let y=0; y<qsLength; y++) {
      const [r, i] = qs[x][y];
      let sum = 0;
      let ri = r;
      for (ri++; ri; ri -= ri&-ri) {
        sum += d[ri];
      }
      ans[i] = (r-x+1) - sum;
    }
  }
  for (let i=0; i<q; i++) {
    console.log(ans[i]);
  }
  return;
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
