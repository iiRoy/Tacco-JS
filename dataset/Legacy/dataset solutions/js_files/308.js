x=require('fs').readFileSync('/dev/stdin','utf8').trim().split(/\s/);
i=0;
for(console.log(Math.floor(x[i++]*x[i++]/0.000003305785)/1000000);i<x.length-1;){}