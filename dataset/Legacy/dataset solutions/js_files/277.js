x=require('fs').readFileSync('/dev/stdin','utf8').replace(/,/g,"").trim().split(/\s/);

str2=[];
str="";

for(i=0;i<x.length;i++){
     
    if(x[i].replace(/\./g,"").length<x[i].length){
        console.log("x[i] : "+x[i]);
        if(x[i].replace(/\./g,"").length>=3&&x[i].replace(/\./g,"").length<=6){
            
            if(x[i].search(/\./)==x[i].length-1){
                str += x[i].replace(/\./g,"");
                str2.push(str);
            }else{
                str += x[i];
            }
            
            
        }else{
         str="";
           
            
        }
    }else if(x[i].length>=3&&x[i].length<=6){
        str += x[i]+" ";
    }
}
for(i=0;i<str2.length;){
    console.log(str2[i++]);
}