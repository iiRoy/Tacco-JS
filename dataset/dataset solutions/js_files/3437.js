'use strict'
function _(s){let l=s.split('\n');if(l[l.length-1]=='')l.pop();this.l=l;this.y=0}
_.prototype.ints = function(){return this.l[this.y++].split(' ').map(v=>+v)}
_.prototype.intv = function(){const y=this.y;this.y=this.l.length;return this.l.slice(y).map(v=>+v)}
_.prototype.strv = function(){const y=this.y;this.y=this.l.length;return this.l.slice(y)}
_.prototype.strn = function(n){const y=this.y;this.y+=n;return this.l.slice(y,y+n)}
const $ = new _(require("fs").readFileSync("/dev/stdin", "utf8"));
(()=>{

const n = $.ints()[0]
const a = $.ints()
let s = 0
for(let e of a){
    s += e
}
let avg = s / n
let neighbor = a[0]
let needle = 0
for(let i = 1;i<n;i++){
    if(Math.abs(a[i]-avg) < Math.abs(neighbor-avg)){
        neighbor = a[i]
        needle = i
    }
}
console.log(needle)
})()