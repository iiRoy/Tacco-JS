function main() {
  var
  i = 0, j,
  wh, startXY, goalXY, n,
  board;
  for (;;) {
    wh = input[i++].split(' ').map(Number);
    if (!wh[0] && !wh[1]) break;
    
    board = initBoard(wh[0], wh[1]);
    
    startXY = input[i++].split(' ').map(Number);
    goalXY  = input[i++].split(' ').map(Number);
    n = Number(input[i++]);
    for (j = 0; j < n; j++) {
      putBlock.bind(null, board).apply(null, input[i++].split(' ').map(Number));
    }
    
    console.log(canGoToGoal(board, startXY, goalXY) ? 'OK' : 'NG');
  }
}

function initBoard(w, h) {
  var
  i, j,
  board = [];
  for (i = 0; i < w; i++) {
    board.push([]);
    for (j = 0; j < h; j++) {
      board[i][j] = 0;
    }
  }
  return board;
}

function putBlock(board, c, d, x, y) {
  var
  i, j,
  b = [[4,2], [2,4]][d];
  for (i = 0; i < b[0]; i++) {
    for (j = 0; j < b[1]; j++) {
      board[x - 1 + i][y - 1 + j] = c;
    }
  }
}

function canGoToGoal(board, startXY, goalXY) {
  var
  queue = [],
  to = [[-1,-1], [ 0,-1], [ 1, -1],
        [-1, 0],          [ 1,  0],
        [-1, 1], [ 0, 1], [ 1,  1]],
  sx = startXY[0] - 1, sy = startXY[1] - 1,
  gx = goalXY[0] - 1, gy = goalXY[1] - 1,
  xym, x, y,
  m = {},
  c = board[sx][sy];
  
  if (c === 0) return false;
  
  queue.push([sx, sy, {}]);
  
  for (;queue.length >= 1;) {
    xy = queue.shift();
    x = xy[0]; y = xy[1];
    if (x < 0 || board.length <= x || c !== board[x][y]) continue;
    if (x === gx && y === gy) return true;
    m[[x, y]] = true;
    
    for (i = 0; i < 8; i++) {
      if (!m[[x + to[i][0], y + to[i][1]]]) {
        queue.push([x + to[i][0], y + to[i][1]]);
      }
    }
  }
  
  return false;
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