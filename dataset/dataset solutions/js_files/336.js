function main() {
  var
  i, j, w, h, t, l,
  line, cache, map, isLoop,
  len = input.length;
  for(i = 0; i < len; i++) {
    line = input[i].split(' ');
    w = parseInt(line[0], 10);
    h = parseInt(line[1], 10);
    if(w === 0 && h === 0) break;
    map = [];
    cache = {};
    for(j = 0; j < h; j++) map[j] = input[++i];
    t = 0;
    l = 0;
    isLoop = false;
    while(map[t].charAt(l) !== '.') {
      cache[[t, l]] = true;
      switch(map[t].charAt(l)){
      case '>':
        l += 1;
        break;
      case '<':
        l -= 1;
        break;
      case 'v':
        t += 1;
        break;
      case '^':
        t -= 1;
        break;
      }
      if(cache[[t, l]] === true) {
        isLoop = true;
        break;
      }
    }
    console.log(isLoop ? 'LOOP' : [l, t].join(' '));
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