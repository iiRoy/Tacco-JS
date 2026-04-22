function Main(input) {
  input = input.split("\n");
  var H = parseInt(input[0].split(" ")[0]);
  var W = parseInt(input[0].split(" ")[1]);
  var K = parseInt(input[0].split(" ")[2]);
  input.shift();
  var c = input.map(i => i.split(""));
  var ans =0;
  c.splice(H,c.length);
  var maph = new Array([0],[1]);
  for(var i=0;i<H-1;i++){
    var mapsub = new Array(0);
    for(var j=0;j<maph.length;j++){
      var zero =[...maph[j]];
      var one =[...maph[j]];
      zero.push(0);
      one.push(1);
      mapsub.push(zero);
      mapsub.push(one);
    }
    maph=mapsub;
  }
  var mapw = new Array([0],[1]);
  for(var i=0;i<W-1;i++){
    var mapsub = new Array(0);
    for(var j=0;j<mapw.length;j++){
      var zero =[...mapw[j]];
      var one =[...mapw[j]];
      zero.push(0);
      one.push(1);
      mapsub.push(zero);
      mapsub.push(one);
    }
    mapw=mapsub;
  }
  var blacks=0;
  for(var i=0;i<maph.length;i++){
    for(var j=0;j<mapw.length;j++){
      for(var k=0;k<H;k++){
        for(var l=0;l<W;l++){
          if(maph[i][k]==0&&mapw[j][l]==0&&c[k][l]=="#"){
            blacks++;
          }
        }
      }
      if(blacks==K){
        ans++;
      }
      blacks=0;
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