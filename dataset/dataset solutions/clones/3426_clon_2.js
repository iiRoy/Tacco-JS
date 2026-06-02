entrada=require("fs").readFileSync("/dev/stdin","utf8");
Math.min.apply(null,[...Array(entrada.length-2)].map((_,pos)=>Math.abs(753-entrada.slice(pos,pos+3)|0)));
