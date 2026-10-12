function Main(input){
  var lines=input.split('\n');
  var count=[];
  for(var x in lines){
    if(lines[x]=="")break;
    for(var i=0;i<lines[x].length;++i){
    	if(!count[lines[x][i].toLowerCase()]) count[lines[x][i].toLowerCase()]=1;
    	else ++count[lines[x][i].toLowerCase()];
    }
  }
  for(var i=0x61;i<=0x7a;++i){
  	var c = String.fromCharCode(i);
  	console.log(c+" : "+((count[c])?count[c]:0));
  }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));