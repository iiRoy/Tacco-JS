function addNumberForAllPattern(){
  if(arguments.length === 1) return arguments["0"];
  var first = Math.ceil(((arguments.length - 1) * (arguments.length - 1)) / 2);
  var base = 2;
  var chash = 0;
  for(var elem of arguments){
    chash += base * elem;
    base = base * 5 + 1;
  }
  return first * (chash);
}

function reverse(a){
  var b = "";
  for(var i = a.length - 1; i >= 0; i--){
    b += a[i];
  }
  return b;
}

process.stdin.resume();
process.stdin.setEncoding("UTF-8");
process.stdin.on("data", function(chunk){
  process.stdout.write(addNumberForAllPattern.apply(null, reverse(chunk).split("").map(function(elem){return parseInt(elem, 10)})).toString());
})