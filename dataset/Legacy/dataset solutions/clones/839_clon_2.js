function C(){
var best=0;
var pos=[];
for(var r=1;r<=8;r++){
for(var c=1;c<=8;c++){
if(board[r][c]!=".")continue;
var n=lookup(r,c,"x","o");
if(n>best){pos=[r,c];best=n;}
}
}
return pos;
}

function D(){
var best=0;
var pos=[];
for(var r=8;r>=1;r--){
for(var c=8;c>=1;c--){
var n=lookup(r,c,"o","x");
if(board[r][c]!=".")continue;
if(n>best){pos=[r,c];best=n;}
}
}
return pos;
}
//------------------------------------------------------
function lookup(r,c,p,q){
var ys=[-1,-1,-1,0,0,1,1,1];
var xs=[-1,0,1,-1,1,-1,0,1];
var total=0;
for(var t=0;t<8;t++){
var YY=ys[t];
var XX=xs[t];
var n=0;
var m=1;

while(true){
   if(board[r+YY*m][c+XX*m]=="f" || board[r+YY*m][c+XX*m]==".")break;
   else if(board[r+YY*m][c+XX*m]==p)n++;
   else if(board[r+YY*m][c+XX*m]==q){total+=n;break;}
   m++;
}
}
return total;
}
//----------------------------------------------------------
function flip(r,c,p,q){
board[r][c]=q;
var ys=[-1,-1,-1,0,0,1,1,1];
var xs=[-1,0,1,-1,1,-1,0,1];
var n=0;
for(var t=0;t<8;t++){
var YY=ys[t];
var XX=xs[t];
var n=0;
var m=1;
var ok=false;
while(true){
   if(board[r+YY*m][c+XX*m]=="f" || board[r+YY*m][c+XX*m]==".")break;
   else if(board[r+YY*m][c+XX*m]==p)ok=true;
   else if(board[r+YY*m][c+XX*m]==q){
      if(ok){
         while(m--)board[r+YY*m][c+XX*m]=q;
      }
      break;
   }
   m++;
}
}


}
// var input = require('fs').readFileSync('/dev/stdin', 'utf8');
input = '........\n........\n........\n...ox...\n...xo...\n........\n........\n........';

var lines=input.trim().split("\n");
var board=[];
board.push("ffffffffff".split(""));
lines.forEach(function(s){
s="f"+s+"f";
board.push(s.split(""));
});
board.push("ffffffffff".split(""));
var skipped=0;


while(true){

var moveC=C();
if(moveC.length==0)skipped++;
else {skipped=0;flip(moveC[0],moveC[1],"x","o");}
if(skipped==2)break;



var moveD=D();
if(moveD.length==0)skipped++;
else {skipped=0;flip(moveD[0],moveD[1],"o","x");}

if(skipped==2)break;



}
board.shift();
board.pop();
console.log(board.join("\n").replace(/\,|f/g,""));
