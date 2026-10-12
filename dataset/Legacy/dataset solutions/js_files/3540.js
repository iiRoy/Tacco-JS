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
    let [N, x] = lines[0].split(" ").map(v=>v-0);
    const list = lines[1].split(" ").map(v=>v-0).sort((a,b)=>a-b);
    let ans = 0;
    for(let i=0;i<N;i++){
        if(x<0) break;
        x -= list[i];
        if(x>=0) ans++;
    }
    console.log(ans);
    
});
