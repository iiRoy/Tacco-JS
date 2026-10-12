var reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
reader.on('line', function (line) {
  var i,x,result="";
  var a = line.split(' ');
  var b = parseInt(a[0],10);
  for(i=3;i<=b;i++){
    x = i;  
    if(x%3==0){
      result += " ";
      result += x;
    }
    else{
      for( ; ;x/=10){
        if(x<1)
          break;
        if(x%10==3){
          result += " ";
          result += x;
          break;
        }
      }
    }
  }
  console.log(result);
  process.exit();
});
process.stdin.on('end', function () {
});