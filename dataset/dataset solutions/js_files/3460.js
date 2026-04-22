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
var mod = 1e9 + 7;

console.log(main());
function main(){
  var h = o.a();
  var w = o.a();
  if(w === 1)return 1;
  var k = o.a();
  var dp = Array(h+1).fill(0).map(a=>Array(w+1).fill(0));
  dp[0][1] = 1;
  var v = [1,1,2,3,5,8,13,21,34]
  for(var i = 1; i <= h; i++){
    dp[i][1] = dp[i-1][1] * v[w-1];
    dp[i][1] += dp[i-1][2] * v[w-2];
    dp[i][1] %= mod;
    for(var j = 2; j < w; j++){
      dp[i][j] = dp[i-1][j-1] * v[j-2] * v[w-j];
      dp[i][j] += dp[i-1][j] * v[j-1] * v[w-j];
      dp[i][j] += dp[i-1][j+1] * v[j-1] * v[w-j-1];
      dp[i][j] %= mod;
    }
    dp[i][w] = dp[i-1][w-1] * v[w-2];
    dp[i][w] += dp[i-1][w] * v[w-1];
    dp[i][w] %= mod;
  }
  return dp[h][k];
}