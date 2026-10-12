function Main(input) {
  var inp = input.split('\n');

  var tate = Math.floor(inp[0]);
  var yoko = Math.floor(inp[1]);
  var kuro = Math.floor(inp[2]);
  
  var ans = 0;
  
  if (tate > yoko) {
    ans = Math.ceil(kuro / tate);
  } else {
    ans = Math.ceil(kuro / yoko);
  }
  
  console.log(ans);
}
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));