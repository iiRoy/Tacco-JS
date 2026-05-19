    s=require("fs").readFileSync("/dev/stdin","utf8");  
Math.min.apply(null,[...Array(s.length-2)].map((_,i)=>Math.abs((s.slice(i,i+3)|0)-753)));
