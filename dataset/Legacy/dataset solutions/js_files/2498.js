function main(arg) {
    var honsuu = arg.split("\n")[0];
    var ngs = arg.split("\n")[1].split(/\s/g);
    var kekka = 0;
    //ソート
    ngs.sort(
		function(a,b){
			return (a < b ? 1 : -1);
		}
	);
	for(i=0;i<honsuu;i++){
	    ngs[i] = parseInt(ngs[i]);
	}
	//forループ
	for(i=0;i<honsuu;i++){
		for(j=i+1;j<honsuu-1;j++){
			for(k=honsuu;k>j;k--){
                if(ngs[i]<ngs[j]+ngs[k]){
                    kekka += k-j;
                    break;
                }
			}
		}
	}
	console.log(kekka);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));