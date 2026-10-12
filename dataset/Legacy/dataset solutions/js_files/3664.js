var input=require("fs").readFileSync(0,"utf8").split("\n");
var m=input[0].split(" ");
n=+m[0];
m=+m[1];
var qq=input.slice(1,1+m).map(ln=>ln.split(" ").map(Number));
qq.sort((p,q)=>p[1]-q[1]);
var ans=0;
var las=-1;
qq.map(q=>{
  if(las<=q[0]){
    las=q[1];
    ans++;
  }
});
console.log(ans);
