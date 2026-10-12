// 標準入力
var fs = require('fs'),
length = fs.fstatSync(process.stdin.fd).size,
buffer = new Buffer(length),
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
input = buffer.toString('utf8', 0, bytesRead).trim().split('\n');
main();
 
function main(){
  for(var i = 0, len = input.length; i < len; i++){
    var c = input[i].split('');
    
    var count = [0,0,0,0,0,0,0,0,0,0,0];
    for(var j = 0, jlen = c.length; j < jlen; j++){
      count[c[j]]++; // 入力の個数をカウント
    }

    var result = [];
  JLOOP:for(var j = 1; j <= 9; j++){
      // 引く牌のループ

      if(count[j] == 4 || (!count[j-1] && !count[j] && !count[j+1])){
        continue;
      }
    
      for(var k = 1; k <= 9; k++){
        if(count[k] == 0)
          continue;

        var count3 = count.slice(0);
        count3[j]++;
        count3[k] -= 2;
        
        for(var l = 1; l <= 9; l++){
          if(count3[l-1] >= 1 && count3[l] >= 1 && count3[l+1] >= 1){
            count3[l-1]--;
            count3[l]--;
            count3[l+1]--;
          }
          if(count3[l-1] >= 1 && count3[l] >= 1 && count3[l+1] >= 1){
            count3[l-1]--;
            count3[l]--;
            count3[l+1]--;
          }
          if(count3[l] >= 3){
            count3[l] -= 3;
          }
        }
        var sum = 0;
        for(var l = 1; l <=9; l++){
          sum += count3[l];
        }

        if(!sum){
          result.push(j);
          continue JLOOP;
        }
      }
    }

    console.log(result.length?result.join(' '):'0');
    

  }
  
}