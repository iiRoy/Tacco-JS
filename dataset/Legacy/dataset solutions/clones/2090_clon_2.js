"use strict";
var data=require("fs").readFileSync("/dev/stdin","utf8");
var tok=data.split(/ |\n/),ptr=0;
function nxt(flag){return flag?tok[ptr++]:+tok[ptr++];}
function nxts(len,flag){return flag?tok.slice(ptr,ptr+=len):tok.slice(ptr,ptr+=len).map(v=>+v);}
function nxtm(h,w,flag){var out=[],j=0;if(flag)for(;j<h;j++)out.push(tok.slice(ptr,ptr+=w));else for(;j<h;j++)out.push(tok.slice(ptr,ptr+=w).map(v=>+v));return out;}
function makeArray(val){var args=arguments,c=args.length,out="Array(args["+--c+"]).fill().map(x=>{return "+val+";})";while(--c)out="Array(args["+c+"]).fill().map(x=>"+out+")";return eval(out);}

var m,tree,level,par,res,byLevel;

//var output = solve();
//if(output !== undefined)console.log(output);

function solve(){
  m = nxt();
  tree = makeArray("[]", m);
  level = Array(m);
  byLevel = makeArray("[]",m);
  par = Array(m);
  res = Array(m);
  for(var j = 1; j < m; j++){
    var u = nxt()-1, v = nxt()-1;
    tree[u].push(v);
    tree[v].push(u);
  }
  walk(0,-1,0);
  var oddCnt = 0, evenCnt = 0;
  for(var j = 0; j < m; j++){
    res[j] = level[j] % 2;
    if(res[j])oddCnt++;
    else evenCnt++;
  }
  var c1 = Math.ceil(m/3), c3 = m/3|0, c2 = m-c1-c3;
  var p1 = 1, p2 = 2, p3 = 3;
  if(oddCnt <= c3){
    for(var j = 0; j < m; j++){
      if(res[j])res[j] = p3, p3 += 3;
      else{
        if(p1 <= m)res[j] = p1, p1 += 3;
        else if(p2 <= m)res[j] = p2, p2 += 3;
        else res[j] = p3, p3 += 3;
      }
    }
  }else if(evenCnt <= c3){
    for(var j = 0; j < m; j++){
      if(res[j] === 0)res[j] = p3, p3 += 3;
      else{
        if(p1 <= m)res[j] = p1, p1 += 3;
        else if(p2 <= m)res[j] = p2, p2 += 3;
        else res[j] = p3, p3 += 3;
      }
    }
  }else{
    for(var j = 0; j < m; j++){
      if(res[j]){
        if(p1 <= m){
          res[j] = p1;
          p1 += 3;
        }else{
          res[j] = p3;
          p3 += 3;
        }
      }else{
        if(p2 <= m){
          res[j] = p2;
          p2 += 3;
        }else{
          res[j] = p3;
          p3 += 3;
        }
      }
    }
    }
  
  return res.join(" ");
}

function walk(node,from,dist){
  level[node] = dist;
  byLevel[dist].push(node);
  par[node] = from;
  for(var to of tree[node]){
    to = +to;
    if(to === from)continue;
    walk(to,node,dist+1);
  }
}

if (process.argv.length <= 2) require("child_process").fork("Main.js", ["1"], { execArgv: ["--stack-size=240000"] });
else {
  var output = solve();
  if(output !== undefined)console.log(output);
}
