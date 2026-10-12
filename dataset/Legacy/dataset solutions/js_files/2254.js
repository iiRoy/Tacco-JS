function Main(input) {
  input = input.split("\n");
  var H = parseInt(input[0].split(" ")[0]);
  var W = parseInt(input[0].split(" ")[1]);
  var mod = Math.pow(10,9)+7;
  input.shift();
  input.splice(H,input.length);
  var S = input.map(i => i.split(""));
  var edge = new Array();
  var id=0;
  for(var i=0;i<H;i++){
    for(var j=0;j<W;j++){
      if(S[i][j]=="."){
        if(i!=H-1){
          if(S[i+1][j]=="."){
            edge.push([id,id+W]);
          }
        }
        if(j!=W-1){
        if(S[i][j+1]=="."){
            edge.push([id,id+1]);
          }
        }
      }
      id++;
    }
  }
  var map = new Array(H*W);
  for(var i=0;i<H*W;i++){
    var mapsub = new Array(H*W).fill(mod);
    mapsub[i]=0;
    map[i]=mapsub;
  }
  for(var i=0;i<edge.length;i++){
    map[edge[i][0]][edge[i][1]]=1;
    map[edge[i][1]][edge[i][0]]=1;
  }
  var ans =0;
  for(var k=0;k<H*W;k++){
    for(var i=0;i<H*W;i++){
      for(var j=0;j<H*W;j++){
        map[i][j]=Math.min(map[i][k]+map[k][j],map[i][j]);
      }
    }
  }
  for(var i=0;i<H*W;i++){
    for(var j=0;j<H*W;j++){
      if(map[i][j]<mod){
        ans=Math.max(ans,map[i][j]);
      }
    }
  }

  console.log('%s', ans);
  return ans;
}

function debug(n){
  var input = document.getElementById("input"+n).value;
  var ans=Main(input);
  var result="WA";
  if(ans==document.getElementById("output"+n).value.split("\n")[0]){
    result="AC";
  }
  document.getElementById("result"+n).innerHTML=result;
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));