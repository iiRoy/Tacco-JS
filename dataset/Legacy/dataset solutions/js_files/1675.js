process.stdin.resume();
process.stdin.setEncoding('utf8');
// 自分の得意な言語で
// Let's チャレンジ！！

var lines = [];
var reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
reader.on('line', (line) => {
  lines.push(line);
});
reader.on('close', () => {
 var X = parseInt(lines[0],10);


  var count = 0; 

function sum(L){
for(var i=1;i<=100;i++){
	for(var j=1;j<=100;j++){
    	for(var k=1;k<=100;k++){
        	if(i*i + k*k + j*j + i*k + j*i + k*j ===L){
             
            	count++;
            }  
 
        }
     
    }
    
}
  

}

  for(var a=1;a<=X;a++){
   sum(a);
    console.log(count);
    count = 0;
  }
  



  
});