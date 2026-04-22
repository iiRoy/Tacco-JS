let mune = [];
for( let i = 0; i < 4; i++ ) {
  let kai = [];
  for( let j = 0; j < 3; j++ ) {
    kai[j] = [0,0,0,0,0,0,0,0,0,0];
  }
  mune[i] = kai;
}
let input = require('fs').readFileSync('/dev/stdin', 'utf8');
input = input.split("\n");
for( let i = 1; i < input.length; i++ ) {
  let sp = input[i].split(" ").map(Number);
  let m = sp[0] - 1;
  let k = sp[1] - 1;
  let b = sp[2] - 1;
  let n = sp[3];
  mune[m][k][b] += n;
}

for( let i = 0; i < mune.length; i++ ) {
  for( let j = 0; j < mune[i].length; j++ ) {
    console.log( mune[i][j].join(" ") );
  }
  if( i !== mune.length - 1 ){
    console.log("####################");  
  }
}

