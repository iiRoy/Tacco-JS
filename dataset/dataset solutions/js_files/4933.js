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
    const [N, A, B] = lines[0].split(" ").map(v=>v-0);
    const list = lines[1].split("");
    const map = [];
    let go = 0;
    let go2=0;
    list.forEach((v,i)=>{
        map[i] = false;
        if(go < A+B){
            if(v==="a"){
                go++;
                map[i] = true;
            }else if(v==="b" && go2 < B){
                go++;
                go2++;
                map[i] = true;
            }
        }
    });
    console.log(map.map(v=>v?"Yes":"No").join("\n"));
});
