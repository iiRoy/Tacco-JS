function main() {
  function howMuch(gram) {
    var
    i, j, w, g, c, p,
    min, _pat,
    pat = [[0,[]]];
    for(i = 0; i < 3; i++) {
      w = [200,300,500][i];
      _pat = [];
      while(p = pat.shift()) {
        g = p[0];
        c = p[1];
        for(j = 0; j*w+g <= gram; j++) {
          _pat.push([j*w+g,c.concat(j)]);
        }
        _pat.push([j*w+g,c.concat(j)]);
      }
      pat = _pat;
//      console.log(pat);
    }
    pat = _pat;
//    console.log(pat);
    min = Infinity;
    while(p = pat.shift()) {
      g = p[0];
      if(g < gram) continue;
      c = p[1];
      p = ((c[0]%5)*380)+(~~(c[0]/5)*5*(380*0.8 ))
         +((c[1]%4)*550)+(~~(c[1]/4)*4*(550*0.85))
         +((c[2]%3)*850)+(~~(c[2]/3)*3*(850*0.88));
      min = p<min?p:min;
    }
    return min;
  }
  
  var
  end = false;
  input.forEach(function(line) {
    if(line.trim() == '' || end) return;
    if(line == 0){
      end = true;
      return;
    }
    console.log(howMuch(parseInt(line, 10)));
  });
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