prod=sum=0,data=require("fs").readFileSync("/dev/stdin","utf8").split(/\s|,/);for(last=pos=data.length-1;pos--;)sum+=(num=+data[pos--]),prod+=num*data[pos];console.log(prod+"\n"+~~(sum/(last*2)+0.5))
