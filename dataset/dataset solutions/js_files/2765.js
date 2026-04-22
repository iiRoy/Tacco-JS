const main = (inputs) => {
  var TW = 2019;
  var L = inputs[0].split(" ")[0]-0;
  var R = inputs[0].split(" ")[1]-0;
  var lmod = L%TW;
  var rmod = R%TW;
  var mods = [];
  for(var i=L;i<=R;i++){
    var val = i%2019;
    mods.push(val);
    if(val == 0) break;
  }
  mods.sort((a,b)=>a-b);
  console.log(mods[0]*mods[1]);
}

main(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));
