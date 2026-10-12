function main(arg) {
    var place = arg.split("\n")[0];
    var zahyou_nama = arg.split("\n");
    var zahyou = [];
    for(i=1;i<zahyou_nama.length;i++){
        zahyou.push(zahyou_nama[i].split(/\s/g));
    }
    var nagasa_wa = 0;
    for(j=0;j<zahyou.length-1;j++){
        for(k=j+1;k<zahyou.length;k++){
            nagasa_wa += Math.sqrt(Math.pow(zahyou[j][0]-zahyou[k][0],2)+Math.pow(zahyou[j][1]-zahyou[k][1],2));
        }
    }
    console.log(nagasa_wa*2/place);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));