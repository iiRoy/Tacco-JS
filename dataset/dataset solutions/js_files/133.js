function main() {
  function dfs(n,l,r){
    if(n.length === 0) return true;
    return (n[0] > l[0] && dfs(n.slice(1), [n[0]].concat(l), r)) ||
            (n[0] > r[0] && dfs(n.slice(1), l, [n[0]].concat(r)));
  }
  var
  i,
  n = parseInt(input[0], 10),
  nums = input.slice(1);
  for(i = 0; i < n; i++) {
    console.log(dfs(nums[i].split(' ').map(parseFloat), [0], [0]) ? 'YES' : 'NO');
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
  main();
});