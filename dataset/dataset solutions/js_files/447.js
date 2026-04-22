function main() {
  var
  i = 0, j, y, x,
  xy, cells, answers = {},
  dummy = [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2];
  for (;;) {
    xy = input[i++].split(' ').map(parseFloat);
    cells = [];
    if (xy[0] === 0 && xy[1] === 0) break;
    
    for (j = 0; j < xy[1]; j++) {
      cells.push(input[i++].split(' ').map(parseFloat));
    }
    cells.push(dummy);
    
    answer = 0;
    answers = {};
    for (x = 0; x < xy[0]; x++) answers[[x, 0]] = cells[0][x] === 0 ? 1 : 0;
    for (y = 0; y < xy[1]; y++) {
      for (x = 0; x < xy[0]; x++) {
        answers[[x, y]] = answers[[x, y]] || 0;
        switch (cells[y][x]) {
        case 0:
          if (cells[y + 1][x - 1] !== 2) answers[[x - 1, y + 1]] = (answers[[x - 1, y + 1]] || 0) + answers[[x, y]];
          answers[[x, y + 1]] = (answers[[x, y + 1]] || 0) + answers[[x, y]];
          if (cells[y + 1][x + 1] !== 2) answers[[x + 1, y + 1]] = (answers[[x + 1, y + 1]] || 0) + answers[[x, y]];
          break;
        case 1:
          break;
        case 2:
          answers[[x, y + 2]] = (answers[[x, y + 2]] || 0) + answers[[x, y]];
          break;
        }
      }
    }

//    show(xy, answers);

    for (y = xy[1]; y <= xy[1] + 1; y++) {
      for(x = 0; x < xy[0]; x++) {
        answer += answers[[x, y]] || 0;
      }
    }

    console.log(answer);
  }
}


function show(xy, answers) {
  var
  x, y, line;
  for (y = 0; y <= xy[1]; y++) {
    line = [];
    for (x = 0; x < xy[0]; x++) {
      line.push(answers[[x, y]] || 0);
    }
    console.log(line.join(' '));
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