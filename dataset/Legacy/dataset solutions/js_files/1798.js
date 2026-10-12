r=require("fs").readFileSync("/dev/stdin","utf8").split("\n");
n=parseInt(r[0],10);
v={};
for(i=0;i<n;i++){
    tmp=r[1+i].split(" ");
    v[i]={};
    v[i][0]=parseInt(tmp[0],10);
    v[i][1]=parseInt(tmp[1],10);
}
q=parseInt(r[++i]);
v2={};
for(j=0;j<q;j++){
    tmp=r[1+i+j].split(" ");
    v2[j]={};
    v2[j][0]=parseInt(tmp[0],10)-1;
    v2[j][1]=parseInt(tmp[1],10);
}
for(i=0;i<q;i++)
{
    x=v2[i][0];
    L=v2[i][1];

    val=0;
    for(w=0;w<=L;x>>=1)
    {
        w+=v[x][1];
        if(w<=L)val+=v[x][0];
        if(x==0)break;
    }
    console.log(val);
}