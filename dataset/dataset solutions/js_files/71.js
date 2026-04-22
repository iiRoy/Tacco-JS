function main() {
  var
  a = 'a'.charCodeAt(0),
  t = 't'.charCodeAt(0),
  z = 'z'.charCodeAt(0);
  function s(c,n){
    if(c === ' ' || c === '.') return c;
    c = c.charCodeAt(0);
    c -= n;
    return String.fromCharCode(c > z ? a + c - z : c);
  }
  function d(c){
    c = c.charCodeAt(0) - t;
    return c < 0 ? (z - t) + -c : c;
  }
  input.forEach(function(line){
    var
    n, words;
    if(line.trim() === '') return;
//    console.log(line);
    words = line.split(/[ \.]/g);
    for(i = 0; i < words.length; i++){
      n = d(words[i]);
      if(words[i].split('').map(function(c){
        return s(c,n);
      }).join('') in {'the':0,'this':0,'that':0}){
        break;
      }
    }
//    console.log(n);
    console.log(line.split('').map(function(c){
      return s(c,n);
    }).join(''));
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