process.stdin.resume();
process.stdin.setEncoding('utf8');

var lines = [];
var reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
reader.on('line', (line) => {
  lines.push(line);
});
reader.on('close', () => {
    const [Q, H, S, D] = lines[0].split(" ").map(v=>v-0);
    const N = lines[1]-0;
    if(N/2===0){
        const unit = Math.min(Q*8, H*4, S*2, D);
        console.log(N/2*unit);
    }else{
        const unit1 = Math.min(Q*4, H*2, S);
        const unit2 = D;
        if(unit1*2 < D){
            console.log(N*unit1);
        }else{
            console.log(~~(N/2) * unit2 + unit1);
        }
    }
});
