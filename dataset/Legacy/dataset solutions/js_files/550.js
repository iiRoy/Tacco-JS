function main() {
  var
  i, j, n, m,
  table, line, str;
  for(i = 0; n = parseInt(input[i++], 10); ) {
    table = {};
    for(j = 0; j < n; j++) {
      line = input[i++].split(' ');
      table[line[0]] = line[1];
    }
    m = parseInt(input[i++], 10);
    str = [];
    for(j = 0; j < m; j++, i++) {
      str.push(table[input[i]] || input[i]);
    }
    console.log(str.join(''));
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
  input = input.split(/\r\n|\r|\n/g);
  main();
});