// https://atcoder.jp/contests/abc049/tasks/arc065_b

function main(args) {
  const [N, K, L] = args[0].split(' ').map(Number);
  let a = [], 
      b = [], 
      c = [],
      results = [];
  
  for (let i=0; i<N; i++) {
    a[i] = N+1;
    b[i] = N+1;
    results[i] = 0;
  }
  for (let i=1, len=K+1; i<len; i++) {
    const [p, q] = args[i].split(' ').map(Number);
    const min = Math.min(a[p-1], a[q-1], p);
    a[p-1] = min;
    a[q-1] = min;
  }
  for (let i=K+1, len=K+L+1; i<len; i++) {
    const [r, s] = args[i].split(' ').map(Number);
    const min = Math.min(b[r-1], b[s-1], r);
    b[r-1] = min;
    b[s-1] = min;
  }
  
  for (let i=0; i<N; i++) {
    if (results[i] == 0) {
      c.length = 0;
      c[0] = i;
      if (a[i] <= N && b[i] <= N) {
        for (let j=i+1; j<N; j++) {
          if (a[i] == a[j] && b[i] == b[j]) {
            c.push(j);
          }
        }
      }
      for (let j=0, len=c.length; j<len; j++) {
        results[c[j]] = len;
      }
    }
  }
  //console.log(a.join(' '));
  //console.log(b.join(' '));
  console.log(results.join(' '));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n'));
