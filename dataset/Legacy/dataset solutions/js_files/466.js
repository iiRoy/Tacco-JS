function circle(part) {
  var
  m = part.length, i, j,
  part2 = [];
  
  for (i = 0; i < m; i++) part2[i] = [];
  
  for (i = 0; i < m; i++) {
    for (j = 0; j < m; j++) {
      part2[i][m - j - 1] = part[j][i];
    }
  }
  
  return part2;
}

function main() {
  var
  image, part, parts,
  searchFlag, checkFlag,
  i, j, x, y, ax, ay, h, k, l, n, m, line;
  for (;;) {
    // 入力の処理
    line = input.shift().split(/\s+/).map(parseFloat);
    n = line[0]; m = line[1];
    if (n === 0 && m === 0) break;
    image = [];
    for (i = 0; i < n; i++) image.push(input.shift().split(/ +/).map(parseFloat));
    part = [];
    for (i = 0; i < m; i++) part.push(input.shift().split(/ +/).map(parseFloat));
    parts = [];
    for (i = 0; i < 4; i++, part = circle(part)) parts.push(part);
    
    // 全探索
    searchFlag = true;
    ax = ay = 99999999;
    search:
    for (i = 0; i < n - m; i++) {
      for (j = 0; j < n - m; j++) {
        for (h = 0; h < 4; h++) {
          checkFlag = true;
          x = y = 0;
          check:
          for (k = 0; k < m; k++) {
            for (l = 0; l < m; l++) {
              if (parts[h][k][l] === -1) continue;
              if (parts[h][k][l] !== image[i + k][j + l]) {
                checkFlag = false;
                break check;
              }
              if (x === 0 && y === 0) {
                x = j + l + 1;
                y = i + k + 1;
              }
            }
          }
          
          if (checkFlag) {
            if (x < ax) {
              ax = x;
              ay = y;
            }
            if (x === ax && y < ay) {
              ay = y;
            }
          }
        }
      }
    }
    if (ax !== 99999999 && ay !== 99999999) {
      console.log(ax + ' ' + ay);
    } else {
      console.log('NA');
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
  main();
});