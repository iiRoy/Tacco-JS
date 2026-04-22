'use strict'

/////////////////////////////////////
//コピペスペース//////////////////////

//定数
const INF  =  900719925474099 // Math.floor(Number.MAX_SAFE_INTEGER / 10);

//スペース区切りの数字列を数字の配列にして返す
function mapint(line){return line.split(' ').map((v)=>parseInt(v));}

function lower_bound(d,a,b,e){
    for(var c;1<b-a;)
        d[c=0|(a+b)/2]<e ? a=c : b=c;
    return d[a]<e?b:a
};

//コピペスペース//////////////////////
/////////////////////////////////////

function Main(input){
	let temp = input.trim().split('\n');
	let temp2 = mapint(temp[0]);
	let n = temp2.shift();
	let q = temp2.shift();

	let stx = new Array(n);
	for(let i=1;i<=n;i++){
		stx[i-1] = mapint(temp[i]);
	}

	let d = new Array(q);
	for(let i=1;i<=q;i++){
		d[i-1] = parseInt(temp[n+i]);
	}

	stx.sort((a,b)=>b[2]-a[2]);
	//console.log(stx.map((a)=>a.join(' ')),d);

	let ans = new Array(q).fill(-1);
	for(let i=0;i<n;i++){
		let l = lower_bound(d,0,q,stx[i][0]-stx[i][2]);
		let r = lower_bound(d,l,q,stx[i][1]-stx[i][2]);
		if(l<r){
			for(let j=l;j<r;j++){
				ans[j] = stx[i][2];
			}
		}
		//console.log('i:',i,'l:',l,'r:',r,ans);
	}
	console.log(ans.join('\n'));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
