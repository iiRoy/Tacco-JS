function gets(str){
  this._s = str.split("\n");
  this._y = 0;
};
gets.prototype = {
  a: function(f){
    var s = this._s, y = this._y, r;
    if(typeof s[y] === "string")s[y] = s[y].split(" ").reverse();
    r = s[y].pop();
    if(!s[y].length)this._y++;
    return f?r:+r;
  },
  l: function(f){
    var s = this._s[this._y++].split(" ");
    return f?s:s.map(a=>+a);
  },
  m: function(n,f){
    var s = this._s, y = this._y, r = [], i = 0;
    if(f)for(;i < n; i++)r[i] = s[y+i].split(" ");
    else for(;i < n; i++)r[i] = s[y+i].split(" ").map(a=>+a);
    this._y += n;
    return r;
  },
};
var o=new gets(require("fs").readFileSync("/dev/stdin","utf8"));

console.log(main());
function main(){
  var n = o.a();
  var x = o.m(n);
  var t = (x[0][0]+x[0][1]) & 1;
  for(var i = 1; i < n; i++){
    var u = (x[i][0]+x[i][1]) & 1;
    if(u !== t)return -1;
  }
  var m = 32 - t;
  var d = [1<<30];
  
  for(i = 1; i < 31; i++){
    d[i] = d[i-1] >> 1;
  }
  if(m % 2 === 0)d[31] = 1;
  var w = [];
  for(i = 0; i < n; i++){
    w[i] = "";
    for(var j = 0; j < m; j++){
      if(Math.abs(x[i][0]) > Math.abs(x[i][1])){
        if(x[i][0] > 0){x[i][0] -= d[j]; w[i] += "R";}
        else{x[i][0] += d[j]; w[i] += "L";}
      }else{
        if(x[i][1] > 0){x[i][1] -= d[j]; w[i] += "U";}
        else{x[i][1] += d[j]; w[i] += "D";}
      }
    }
  }
  return m + "\n" + d.join(" ") + "\n" + w.join("\n");
}