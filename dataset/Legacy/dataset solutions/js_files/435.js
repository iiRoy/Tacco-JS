function main() {
  var
  inf = 1e9,
  line,
  n, m, a, b, c, t, p, q, r,
  i, j, k;
  
  while (true) {
    line = input.shift().split(' ').map(parseFloat);
    n = line[0]; m = line[1];
    if (n == 0 && m == 0) break;
    
    cost = []; time = [];
    for (i = 1; i <= m; i++) {
      cost[i] = [];
      time[i] = [];
    }
    
    for (i = 0; i < n; i++) {
      line = input.shift().split(' ').map(parseFloat);
      a = line[0]; b = line[1]; c = line[2]; t = line[3];
      cost[a][b] = cost[b][a] = Math.min(c, cost[a][b]||inf);
      time[a][b] = time[b][a] = Math.min(t, time[a][b]||inf);
    }

    for (k = 1; k <= m; k++) {
      for (i = 1; i <= m; i++) {
        for (j = 1; j <= m; j++) {
          cost[i][j] = Math.min(cost[i][j]||inf,(cost[i][k]||inf)+(cost[k][j]||inf));
          time[i][j] = Math.min(time[i][j]||inf,(time[i][k]||inf)+(time[k][j]||inf));
        }
      }
    }
    
    k = parseFloat(input.shift());
    for (i = 0; i < k; i++) {
      line = input.shift().split(' ').map(parseFloat);
      p = line[0]; q = line[1]; r = line[2];
      console.log([cost,time][r][p][q]);
    }
  }
}

var
input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {
  input = input.split('\n');
  var
  start = Date.now();
  main();
  console.log('time: ' + (Date.now() - start));
});