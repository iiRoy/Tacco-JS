"use strict";
var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;
function next(){return +cin[cid++];}
function nextstr(){return cin[cid++];}
function nextbig(){return BigInt(cin[cid++]);}
function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

var myOut = solveWithTrackedMultiples();
if(myOut !== undefined)console.log(String(myOut));

function solveWithTrackedMultiples(){
  var n = next();
  var a = [0].concat(nexts(n));

  if(!(n >= 1) || n % 1 !== 0)return a.reduce((p,q)=>p+q);

  var total = a.reduce((p,q)=>p+q);
  var sums = Array(n + 1).fill(0);
  var divisors = Array(n + 1);
  for(var i = 1; i <= n; i++)divisors[i] = [];

  for(var v = 1; v <= n; v++){
    var av = a[v];
    for(var d = 1; d * d <= v; d++){
      if(v % d !== 0)continue;
      sums[d] += av;
      divisors[v].push(d);
      var other = v / d;
      if(other !== d){
        sums[other] += av;
        divisors[v].push(other);
      }
    }
  }

  var heap = [];
  function up(pos){
    while(pos > 0){
      var par = (pos - 1) >> 1;
      if(heap[par] >= heap[pos])break;
      var tmp = heap[par]; heap[par] = heap[pos]; heap[pos] = tmp;
      pos = par;
    }
  }
  function down(pos){
    for(;;){
      var l = pos * 2 + 1, r = l + 1, best = pos;
      if(l < heap.length && heap[l] > heap[best])best = l;
      if(r < heap.length && heap[r] > heap[best])best = r;
      if(best === pos)break;
      var tmp = heap[pos]; heap[pos] = heap[best]; heap[best] = tmp;
      pos = best;
    }
  }
  function push(x){ heap.push(x); up(heap.length - 1); }
  function pop(){
    var top = heap[0];
    var last = heap.pop();
    if(heap.length){ heap[0] = last; down(0); }
    return top;
  }
  function active(i){ return a[i] < 0 && sums[i] < 0; }

  for(var i = 1; i <= n; i++)if(active(i))push(i);

  while(heap.length){
    var idx = pop();
    if(!active(idx))continue;

    var changed = [];
    for(var k = idx; k <= n; k += idx){
      if(a[k] !== 0){
        var old = a[k];
        a[k] = 0;
        total -= old;
        changed.push([k, old]);
      }
    }

    var touched = Object.create(null);
    for(var c = 0; c < changed.length; c++){
      var pos = changed[c][0], oldValue = changed[c][1];
      var ds = divisors[pos];
      for(var t = 0; t < ds.length; t++){
        var div = ds[t];
        sums[div] -= oldValue;
        touched[div] = 1;
      }
    }
    for(var key in touched){
      var q = +key;
      if(active(q))push(q);
    }
  }

  return total;
}
