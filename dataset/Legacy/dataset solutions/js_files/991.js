const config = {
    input:'/dev/stdin',
    newline:'\n'
};

const x=require('fs').readFileSync(config.input,'utf8').split(config.newline);
const y=require('fs').readFileSync(config.input,'utf8').split(config.newline);
const z;

if(x<y){
    z=x;
    x=y;
    y=z;
}

while((z=x%y)!=0){
    x=y;
    y=z;
}

console.log(y);

