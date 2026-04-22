function Main(input) {
	var idata = input.split(/\n/);
	var b = [];
    var kensuu = idata[0].split(" ")[0];
    var nissuu = idata[0].split(" ")[1];
    var houshuu = 0;
	for(i=0;i<kensuu;i++){
		b[i]=idata[i+1].split(" ");
    }
	//仕事を報酬順に並べ替え
	b.sort(high);
	function high(a,b){
	   return a[1]<b[1];
	}
	//仕事選び
	for(day=0;day<nissuu;day++){
		for(let j=0;j<b.length;j++){
			if(nissuu-day>=b[j][0]){
				houshuu += b[j][1];
				b.splice(j,1);
				break;
			}
		}
	}
	console.log(houshuu);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));