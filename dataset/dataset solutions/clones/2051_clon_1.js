 Main=(o=>{"use strict";o=o.split("\n")[1].split(" ");let t={};for(const s of o)t[s]=(t[s]||0)+1;for(const o of Object.keys(t))t[o]={a:t[o],b:t[o]*(t[o]-1)/2,c:(t[o]-1)*(t[o]-2)/2};var s;for(let c=0;c<o.length;c++){const e=o[c];s=0;for(const o of Object.keys(t))s+=e==o?t[o].c:t[o].b;console.log(s)}}); Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

/* organise actuel la forme du programme. (^.^) */
