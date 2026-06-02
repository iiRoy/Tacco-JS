'use strict'

/////////////////////////////////////
//コピペスペース//////////////////////

//定数
const LIMIT  =  900719925474099 // Math.floor(Number.MAX_SAFE_INTEGER / 10);

//スペース区切りの数字列を数字の配列にして返す
function toint(line){return line.split(' ').map((x)=>parseInt(x));}

function bound_low(arr,left,right,val){
    for(var mid;1<right-left;)
        arr[mid=0|(left+right)/2]<val ? left=mid : right=mid;
    return arr[left]<val?right:left
};

//コピペスペース//////////////////////
/////////////////////////////////////

function Solve(src){
	let rows = src.trim().split('\n');
	let head = toint(rows[0]);
	let n = head.shift();
	let q = head.shift();

	let data = new Array(n);
	for(let i=1;i<=n;i++){
		data[i-1] = toint(rows[i]);
	}

	let query = new Array(q);
	for(let i=1;i<=q;i++){
		query[i-1] = parseInt(rows[n+i]);
	}

	data.sort((x,y)=>y[2]-x[2]);
	//console.log(data.map((x)=>x.join(' ')),query);

	let res = new Array(q).fill(-1);
	for(let i=0;i<n;i++){
		let l = bound_low(query,0,q,data[i][0]-data[i][2]);
		let r = bound_low(query,l,q,data[i][1]-data[i][2]);
		if(l<r){
			for(let j=l;j<r;j++){
				res[j] = data[i][2];
			}
		}
		//console.log('i:',i,'l:',l,'r:',r,res);
	}
	console.log(res.join('\n'));
}

Solve(require("fs").readFileSync("/dev/stdin", "utf8"));
