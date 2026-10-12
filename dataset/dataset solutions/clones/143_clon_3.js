var fs = require('fs'),
length = fs.fstatSync(process.stdin.fd).size,
buffer = Buffer.alloc(length),
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
input = buffer.toString('utf8', 0, bytesRead).split('\n');

main();

function main(){
  for(var i = 0, len = input.length; i < len; i++){
    if(i === len - 1 && input[i] === ''){
      continue;
    }

    var c = input[i].split(',');
    var p = 0, n = 0;

    var ab = (Number(c[1]) - Number(c[3])) / (Number(c[0]) - Number(c[2]));
    var bc = (Number(c[3]) - Number(c[5])) / (Number(c[2]) - Number(c[4]));
    var cd = (Number(c[5]) - Number(c[7])) / (Number(c[4]) - Number(c[6]));
    var da = (Number(c[7]) - Number(c[1])) / (Number(c[6]) - Number(c[0]));

    var slopes = [ab, bc, cd, da];

    for(var j = 0; j < slopes.length; j++){
      if(slopes[j] >= 0){
        p++;
      }else{
        n++;
      }
    }

    var result = (p % 2 === 1) ? 'YES' : 'NO';
    console.log(result);
  }
}