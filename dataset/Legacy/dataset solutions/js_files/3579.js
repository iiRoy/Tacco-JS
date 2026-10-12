var p=require("fs").readFileSync("/dev/stdin","utf8");
p = p.split("\n").map(a=>+a);
console.log(main());
function main(){
  var N = "No";
  var n = p[0];
  var a = {};
  for(i = 1; i <= n; i++){
    if((p[i] ^ i) & 1)return N;
    var u = p[i], v = i;
    while(i < u){
      i++;
      if(p[i] !== i)return N;
      i++;
      if((p[i] ^ i) & 1)return N;
      if(u < p[i]){u = p[i]; a[u] = 1;}
      else if(v === p[i]){
        do{
          v += 2;
        }while(a[v])
      }
      else return N;
    }
  }
  return "Yes";
}