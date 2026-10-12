process.stdin.resume();
process.stdin.setEncoding('utf8');

var lines = []
var reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

reader.on('line', (line) => {
  lines.push(line);
});

reader.on('close', () => {
  var nab = lines[0].split(' ');
  var n = Number(nab[0]);
  var a = Number(nab[1]);
  var b = Number(nab[2]);
  var pass = 0;
  var ab = 1;

  var info = lines[1].split('');
  for(i=0; i<n; i++){
    switch(info[i]){
      case 'a':
        if(pass < a+b){
          console.log("Yes");
          pass++;
          break;
        }else{
          console.log("No")
          break;;
        }
      case 'b':
        if(pass < a+b && b >= ab){
          console.log("Yes");
          pass++;
          ab++;
          break;
        }else{
          console.log("No");
          break;
        }
      case 'c':
        console.log("No");
        break;
    }
  }
});