function Main(input){
  var lines=input.split('\n');
  var s=0;
  for(var i=0;i<10;++i){
    if(lines[i]=="\n")break;
    s+=parseInt(lines[i]);
  }
  console.log(s);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));