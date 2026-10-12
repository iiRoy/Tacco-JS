function Main(input){
var row = input.split("\n")[1].split(" ");
var count = 0;
for(i=0;i<=(row.length-2);i++){
  if(row[i-1]<row[i]&&row[i]<row[i+1] ||
     row[i-1]>row[i]&&row[i]>row[i+1]){
       count +=1;
     }
}
console.log(count);
}
  Main(require('fs').readFileSync('/dev/stdin','utf8'));