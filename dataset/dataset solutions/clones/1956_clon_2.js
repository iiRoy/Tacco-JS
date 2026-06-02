"use strict";
var source=require("fs").readFileSync("/dev/stdin","utf8");
var tokens=source.split(/ |\n/),ptr=0;
function read(one){return one?tokens[ptr++]:+tokens[ptr++];}
function reads(cnt,one){return one?tokens.slice(ptr,ptr+=cnt):tokens.slice(ptr,ptr+=cnt).map(z=>+z);}
function readGrid(row,col,one){var box=[],idx=0;if(one)for(;idx<row;idx++)box.push(tokens.slice(ptr,ptr+=col));else for(;idx<row;idx++)box.push(tokens.slice(ptr,ptr+=col).map(z=>+z));return box;}
function buildArray(val){var arg=arguments,len=arg.length,res="Array(arg["+--len+"]).fill().map(y=>{return "+val+";})";while(--len)res="Array(arg["+len+"]).fill().map(y=>"+res+")";return eval(res);}
var makeQueue=(function(){
  function g(){return new Queue();}
  function Queue(){
    this.store=[];
  }
  Queue.prototype.push=function(item){
    var h=this.store,i=h.length++,j;
    while(i){
      j=i-1>>1;
      if(h[j][0]<=item[0])break;
      h[i]=h[j],i=j;
    }
    h[i]=item;
  };
  Queue.prototype.pop=function(){
    var h=this.store,res=h[0],item=h.pop(),len=h.length,i=0,j;
    if(len===0)return res;
    var half=len>>1;len--;
    while(i<half){
      j=(i<<1)+1;
      if(j<len&&h[j+1][0]<h[j][0])j++;
      if(item[0]<=h[j][0])break;
      h[i]=h[j],i=j;
    }
    h[i]=item;
    return res;
  };
  return g;
})();

var output = solve();
if(output !== undefined)console.log(output);

function solve(){
  var [nodes,edges,silver] = reads(3);
  var route = buildArray("[]",nodes);
  for(var idx = 0; idx < edges; idx++){
    var [from,to,cost,time] = reads(4);
    from--,to--;
    route[from].push([to,cost,time]);
    route[to].push([from,cost,time]);
  }
  var exchange = readGrid(nodes,2);
  var dist = buildArray(1e18,nodes,2501);
  var remain = nodes;
  var answer = buildArray(1e18,nodes);
  var que = new makeQueue();
  if(silver > 2500)silver = 2500;
  que.push([0,0,silver]);
  while(remain){
    var [now,place,coin] = que.pop();
    if(answer[place] === 1e18)remain--, answer[place] = now;
    if(dist[place][coin] < now)continue;
    if(coin < 2500){
      var nt = now + exchange[place][1];
      var nc = coin + exchange[place][0];
      if(nc >= 2500)nc = 2500;
      if(dist[place][nc] > now)dist[place][nc] = nt, que.push([nt,place,nc]);
    }
    for(var idx = 0; idx < route[place].length; idx++){
      var nc = coin - route[place][idx][1];
      if(nc < 0)continue;
      var nt = now + route[place][idx][2], nxt = route[place][idx][0];
      if(dist[nxt][nc] <= nt)continue;
      que.push([nt,nxt,nc]);
    }
  }
  return answer.slice(1).join("\n");
}
