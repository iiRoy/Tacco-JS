function main() {
  var
  i, j, n, m, x,
  len = input.length;
  for(i = 0; i < len; i++) {
    n = parseInt(input[i], 10);
    if(n === 0) break;
    m = ~~(n / 2);
    for(x = 0, j = 0; primes[j] <= m; j++) {
      if(primesTable[n - primes[j]]) x++;
    }
    console.log(x);
  }
}

var
primes = (function(n){
  var
  i, j, flag,
  primes = [2];
  if(n < 2) return [];
  for(i = 3;i <= n; i += 2) {
    flag = true;
    for(j = 0; primes[j] < i*i; j++) {
      if(i % primes[j] == 0) {
        flag = false;
        break;
      }
    }
    if(flag) {
      primes.push(i);
    }
  }
  return primes;
})(50000),
primesTable = primes.reduce(function(m, a) {
  m[a] = true;
  return m;
}, {});

var
input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {
  input = input.split('\n');
  main();
});