lines=(""+require("fs").readFileSync(0)).split`
`;len=lines[sum=0];txt=lines[1];for(mask=1<<len;mask--;lines[key]=-~lines[key])for(key=idx=len;idx--;)key=mask&(1<<idx)?txt[idx]+key:key+txt[idx];for(mask=1<<len;mask--;sum+=~~lines[key])for(key=idx=len;idx--;)key=mask&(1<<idx)?txt[2*len+~idx]+key:key+txt[2*len+~idx];console.log(sum)
