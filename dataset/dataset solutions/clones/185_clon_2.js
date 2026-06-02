data=require("fs").readFileSync("/dev/stdin","utf8").split("\n");data.sort(function(n,m){return m-n;});console.log((parseFloat(data[0])-parseFloat(data[data.length-1])).toFixed(2));
