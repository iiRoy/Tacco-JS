"use strict";
var source=require("fs").readFileSync("/dev/stdin","utf8");
var tokens=source.split(/ |\n/),ptr=0;
function read(flag){return flag?tokens[ptr++]:+tokens[ptr++];}
function reads(num,flag){return flag?tokens.slice(ptr,ptr+=num):tokens.slice(ptr,ptr+=num).map(v=>+v);}
function readm(rows,cols,flag){var out=[],idx=0;if(flag)for(;idx<rows;idx++)out.push(tokens.slice(ptr,ptr+=cols));else for(;idx<rows;idx++)out.push(tokens.slice(ptr,ptr+=cols).map(v=>+v));return out;}
function makeArray(val){var args=arguments,len=args.length,res="Array(args["+--len+"]).fill().map(x=>{return "+val+";})";while(--len)res="Array(args["+len+"]).fill().map(x=>"+res+")";return eval(res);}

var N,g,dep,res;

//var printed = solve();
//if(printed !== undefined)console.log(printed);

function solve(){
  N = read();
  g = makeArray("[]", N);
  dep = Array(N);
  res = Array(N);
  for(var k = 1; k < N; k++){
    var u = read()-1, w = read()-1;
    g[u].push(w);
    g[w].push(u);
  }
  walk(0,-1,0);
  var odds = 0, evens = 0;
  for(var k = 0; k < N; k++){
    res[k] = dep[k] % 2;
    if(res[k])odds++;
    else evens++;
  }
  var part1 = Math.ceil(N/3), part3 = N/3|0, part2 = N-part1-part3;
  var cur1 = 1, cur2 = 2, cur3 = 3;
  if(odds <= part3){
    for(var k = 0; k < N; k++){
      if(res[k])res[k] = cur3, cur3 += 3;
      else{
        if(cur1 <= N)res[k] = cur1, cur1 += 3;
        else if(cur2 <= N)res[k] = cur2, cur2 += 3;
        else res[k] = cur3, cur3 += 3;
      }
    }
  }else if(evens <= part3){
    for(var k = 0; k < N; k++){
      if(res[k] === 0)res[k] = cur3, cur3 += 3;
      else{
        if(cur1 <= N)res[k] = cur1, cur1 += 3;
        else if(cur2 <= N)res[k] = cur2, cur2 += 3;
        else res[k] = cur3, cur3 += 3;
      }
    }
  }else{
    for(var k = 0; k < N; k++){
      if(res[k]){
        if(cur1 <= N){
          res[k] = cur1;
          cur1 += 3;
        }else{
          res[k] = cur3;
          cur3 += 3;
        }
      }else{
        if(cur2 <= N){
          res[k] = cur2;
          cur2 += 3;
        }else{
          res[k] = cur3;
          cur3 += 3;
        }
      }
    }
    }
  
  return res.join(" ");
}

function walk(node,parent,dist){
  dep[node] = dist;
  for(var k = 0; k < g[node].length; k++){
    var to = g[node][k];
    if(to === parent)continue;
    walk(to,node,dist+1);
  }
}

if (process.argv.length <= 2) require("child_process").fork("Main.js", ["1"], { execArgv: ["--stack-size=240000"] });
else {
  var printed = solve();
  if(printed !== undefined)console.log(printed);
}
