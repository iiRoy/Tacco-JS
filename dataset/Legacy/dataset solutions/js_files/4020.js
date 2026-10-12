f=x=>(''+x).split('').reduce((x,y)=>~~x+~~y)

function Main(input) {
max=0;
for(i=input;i--;){
if(max<f(i))max=f(i);
}
console.log(max);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));