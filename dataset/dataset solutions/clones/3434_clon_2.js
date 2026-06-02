function Solve(src){
  var num=Number(src);
  var fact=1;
  var total=0;
  for(var idx=1;idx<=num;idx++)fact*=idx
  vals=[];
  for(var idx=1;idx<=(fact/2);idx++){
    if(fact%idx==0){
      vals.push(idx)
    }
  }
  for(key in vals){
    var sub=0;
    for(var div=0;div<=vals[key]/2;div++)if((vals[key]/2)%div==0)sub++;
    if(sub==75)total++;
  }
  console.log(total);
}
Solve(require('fs').readFileSync('/dev/stdin', 'utf8'));
