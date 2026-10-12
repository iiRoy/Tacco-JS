function main(input) {
  var args = input.split('\n');
  var n = parseInt(args[0]);
  var an = args[1].split(' ');
  var on = [];
  var en = [];
  for(var i = 0; i < n; i++){
    if(i % 2 == 0) en.push(parseInt(an[i]));
    else on.push(parseInt(an[i]));
  }
  en.sort();
  on.sort();

  //最頻値と次の値を求める
  //出力を(x,n) (x2,n2)とする
  Array.prototype.mode2 = function () {
    var arr = [];
    var prevValue;
    this.forEach(function(element,index){
      if(element != prevValue){
        arr.unshift([element,1]);
        prevValue = element;
      }else{
        arr[0][1] += 1;
      }
    })
    
    arr.sort(function(a,b){
      return b[1] - a[1];
    })

    if(!arr[1]){
      arr.push([null,0]);
    }
    return [[arr[0][0],arr[0][1]],[arr[1][0],arr[1][1]]];
  }
  var evModes = en.mode2();
  var odModes = on.mode2();
  var ans = 0;

  if(evModes[0][0] != odModes[0][0]){
    ans = n - (evModes[0][1] + odModes[0][1]);
  }else{
    ans = n - Math.max(evModes[1][1] + odModes[0][1], evModes[0][1] + odModes[1][1]);
  }
  console.log(ans);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));