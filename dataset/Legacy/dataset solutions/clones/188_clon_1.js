x=require('fs').readFileSync('/dev/stdin','utf8').split("\n");x.sort(function(a,b){return b-a;});console.log((x[0]*10-x[x.length-1]*10)/10);
