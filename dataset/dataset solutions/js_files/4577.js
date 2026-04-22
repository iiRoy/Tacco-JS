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
    const [N, M] = lines[0].split(" ").map(v=>v-0);
    const ans = [];
    lines.forEach((v, i)=>{
        const [a, b] = v.split(" ").map(v=>v-0);
        if(i>0){
            ans[a] = (ans[a]||0)+1;
            ans[b] = (ans[b]||0)+1;
        }
    });
    for(let i=1;i<=N;i++){
        console.log(ans[i]||0);
    }
});
