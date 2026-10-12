z=require('fs').readFileSync('/dev/stdin','utf8').trim().split(/\s/);
for(i=0;i<z.length;){
    a=z[i++];
    b=z[i++];
    c=z[i++];
    d=z[i++];
    e=z[i++];
    f=z[i++];
    y=(c*d-a*f)/(b*d-a*e);
    x=(c-b*y)/a;
    console.log((Math.round(x*=1000)/1000).toFixed(3)+" "+(Math.round(y*=1000)/1000).toFixed(3));
}