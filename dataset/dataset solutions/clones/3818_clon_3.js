module.exports=function(t){
var e={};
function r(n){
if(e[n])return e[n].exports;
var i={i:n,l:!1,exports:{}};
e[n]=i;
var o=t[n];
o.call(i.exports,i,i.exports,r);
i.l=!0;
return i.exports
}
r.m=t;
r.c=e;
r.d=function(t,e,n){
if(!r.o(t,e))Object.defineProperty(t,e,{enumerable:!0,get:n})
};
r.r=function(t){
"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"});
Object.defineProperty(t,"__esModule",{value:!0})
};
r.t=function(t,e){
if(1&e)t=r(t);
if(8&e)return t;
if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;
var n=Object.create(null);
r.r(n);
Object.defineProperty(n,"default",{enumerable:!0,value:t});
if(2&e&&"string"!=typeof t)for(var i in t)r.d(n,i,function(e){return t[e]}.bind(null,i));
return n
};
r.n=function(t){
var e=t&&t.__esModule?function(){return t.default}:function(){return t};
r.d(e,"a",e);
return e
};
r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)};
r.p="";
return r(r.s=0)
}([function(t,e,r){
"use strict";
var n=r(1);
var i=n.readFileSync("/dev/stdin","utf8");
r(2)(i)
},function(t,e){
t.exports=require("fs")
},function(t,e,r){
"use strict";
var n=r(3),i=r(5);
t.exports=function(t){
var e=new n(t);
i(e)
}
},function(t,e,r){
"use strict";
var n=r(4);
t.exports=class{
constructor(t){
var e=t.trim();
e=e.split(/\s+/g);
this.inp=new n(e)
}
inr(){return this.inp.deq()}
in(){
var t=this.inp.deq();
return parseInt(t,10)
}
fin(){this.inp.clear()}
}
},function(t,e,r){
"use strict";
t.exports=class{
constructor(){
var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];
this.size=t.length;
this.items=t;
this.ind=0
}
enq(t){
this.size+=1;
this.items.push(t)
}
deq(){
var t=this.items[this.ind];
this.size-=1;
this.ind+=1;
return t
}
clear(){
this.items=[];
this.size=0;
this.ind=0
}
}
},function(t,e,r){
"use strict";
t.exports=function(t){
for(var e=t.in(),r=new Array(e),n=0;n<e;n++){
var a=t.in();
r[n]=a
}
if(0==r[0]){
for(var i=0,o=0,s=1;s<e;s++){
var u=r[s]-o;
if(o<=r[s]){
if(u>1)return void console.log(-1);
if(u==1)i++;
if(u==0)i+=r[s]
}else i+=r[s];
o=r[s]
}
console.log(i)
}else console.log(-1)
}
}]);
