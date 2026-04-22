var input = require('fs').readFileSync('/dev/stdin', 'utf8');
let arr = input.split("\n");
for (let i = 0; i < arr.length; i++) {
    let Arr = arr[i].split(" ").map(Number);
    let H = Arr[0];
    let W = Arr[1];
    if (H === 0 && W === 0) break;
    let str = '';
    for (let hCount = 0; hCount < H; hCount ++) {
      for (let wCount  = 0; wCount < W; wCount ++) {
        if (hCount === 0 || hCount === H-1) {
            str += '#';
        } else {
          if (wCount === 0 || wCount === W-1) {
            str += '#';
          } else {
            str += '.';
          }
            
        }
      }
      str += '\n';
    }
    console.log(str);
}
