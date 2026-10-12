

function Main(input) {
  input = input.split("\n");
  var r = parseInt(input[0].split(" ")[0]);
  var D = parseInt(input[0].split(" ")[1]);
  var x = parseInt(input[0].split(" ")[2]);
  var anss = new Array(10);
  anss[0]=x*r-D;
  for(var i=1;i<10;i++){
    anss[i]=anss[i-1]*r-D;
  }
  var ans=anss.join("\n");

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