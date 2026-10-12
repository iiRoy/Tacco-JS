var input = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
  input += chunk;
});
process.stdin.on('end', function () {
  main(input.split('\n'));
});
function main(inputArr) {
  var i, temp, nGems, map, nMoves, moves = [];

  while ((nGems = +inputArr.shift()) !== 0) {
    map = new Array(21 * 21);
    for (i = 0; i < 21 * 21; i++) {
      map[i] = 0;
    }

    i = 0;
    while (i < nGems) {
      temp = inputArr.shift().split(' ');
      console.log(temp)
      map[(+temp[0]) + 21 * (+temp[1])] = 1;
//      {x: +temp[0], y: +temp[1]};
      i++;
    }
    nMoves = +inputArr.shift();
    i = 0;
    while (i < nMoves) {
      temp = inputArr.shift().split(' ');
      moves.push({d: temp[0], l: +temp[1]});
      i++;
    }
//    **debug show map
    
//    for (i = 0; i < 21; i++) {
//      console.log(map.slice(i*21,i*21+21).join(' '));
//    }
    isAllGems(map, moves) ? console.log('Yes'):console.log('No');
//    for (i = 0; i < 21; i++) {
//      console.log(map.slice(i*21,i*21+21).join(' '));
//    }
  }
}
function isAllGems(map, moves) {
  var pos = 10 + 10 * 21, i, walk;
  moves.forEach(function (m) {
    switch (m.d) {
      case 'N':
        walk = 21;
        break;
      case 'W':
        walk = -1;
        break;
      case 'E':
        walk = 1;
        break;
      case 'S':
        walk = -21;
        break;
    }
    for (i = 0; i < m.l; i++) {
      pos += walk;
      map[pos] = 0;
    }
  });
  for (i = 0; i < 21 * 21; i++) {
     if(map[i] === 1){
       return false;
     }
  }
  return true;
}