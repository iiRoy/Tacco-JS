x=require('fs').readFileSync('/dev/stdin','utf8').trim().split(/\s/).sort(function(a,b){return a-b;});
//console.log(x);
for(mode=[],cnt=0,i=0;i<x.length;i++){
    temp_cnt=1;
    for(j=i+1;j<x.length;j++){
        if(x[i]==x[j]){
            temp_cnt++;
        }
    }
    mode.push(temp_cnt);
}
max=Math.max.apply(null,mode);
k=1;
while(max==Math.max.apply(null,mode)){
    console.log(x[mode.indexOf(Math.max.apply(null,mode))+k++]);
    //console.log(mode.indexOf(Math.max.apply(null,mode)));
    mode.splice(mode.indexOf(Math.max.apply(null,mode)),1);
    
    //console.log(mode);
}