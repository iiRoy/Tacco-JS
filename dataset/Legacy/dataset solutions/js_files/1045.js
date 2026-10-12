(function main(){
  let lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n");
  let [n, k] = lines.shift().split(' ').map(Number);
  let w = lines.map(Number);
  // console.log(w);
  let sum = w.reduce((p, c) => p + c, 0);
  if (k == 1) {console.log(sum);return;}
  let t = [], t2 = [];
  for (let i = 0; i < k; i++){t[i] = 0;t2[i] = []};
  let avg = sum / (k);

  let cnt = 0;
  let max = 0;
  w.forEach(function(e) {
    if (avg - (2 * t[cnt] + e) / 2 > 0) {
    } else {
      avg = sum / (k - cnt - 1);
      max = max < t[cnt] ? t[cnt] : max;
      // console.log(sum, avg);
      cnt++;
    }
    avg = sum / (k - cnt - 1);
    sum -= e;
    t[cnt] += e;
    t2[cnt].push(e);
  });

  // console.log(t, t2);
  max = max < t[cnt] ? t[cnt] : max;
  console.log(max);
})();

