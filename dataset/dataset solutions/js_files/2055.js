// inputに入力データ全体が入る
function Main(input) {
    var H = input[0].split(" ")[0]-0;
    var W = input[0].split(" ")[1]-0;
    var K = input[0].split(" ")[2]-0;
    var map = [];
    for(var i=1;i<=H;i++){
        map[i-1] = input[i];
    }
	ans = H*W;
    var btc = getBit(H-1);
    btc.forEach(bt=>{
        check(map, bt, K ,H);
    });
    console.log(ans);
}

var ans = 0;
function check(map, bt, K, H){
    var aans = bt.cnt;
    var len = map[0].length;
    var pcnt = 0;
    var nsum = [];
    var flg = false;
    var add = false;
    start:for(var i=0;i<len;i++){
        var nbox = 0;
        for(var j=0;j<H;j++){
            if(map[j][i] == "1"){
                nsum[nbox] = (nsum[nbox]||0) + 1;
            }
            if(nsum[nbox] > K){
                if(!flg) return;
                flg = false;
                add = true;
                i--;
                nsum = [];
                continue start;
            }
            if(bt.v[j] == "1") nbox++;
        }
        flg=true;
        if(add) aans++;
		if(i==len-1){
          ans = Math.min(ans, aans);
        }
    }
    return aans;

}

function getBit(len){
    var list = [];
    for(var i=0;i<Math.pow(2,len);i++){
      list.push({cnt:bitCount32(i), v: ("0000000000" + i.toString(2)).slice(-len)});
    }
    return list.sort((a,b)=>a.cnt-b.cnt);
}
function bitCount32 (n) {
  n = n - ((n >> 1) & 0x55555555)
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333)
  return ((n + (n >> 4) & 0xF0F0F0F) * 0x1010101) >> 24
}


Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
