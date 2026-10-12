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
function segTree(n){
	var u = n-1, x = 2;
	while(u)u >>= 1, x <<= 1;
	this.seg = Array(x-1).fill(2e9);
	this.l = x >> 1;
	//console.log('init:',n,x,this.seg,this.l);
  }
  segTree.prototype={
	get:function(x){
	  x += this.l-1;
	  var r = 2e9;
	  while(x >= 0){
		if(this.seg[x] < r)r = this.seg[x];
		x = (x-1)>>1;
	  }
	  if(r === 2e9)r = -1;
	  return r;
	},
	update:function(l,r,t){
		//console.log('update-----',l,r,t);
	  var v = this.seg;
	  q(l,r,0,this.l,0);
	  function q(l,r,x,y,i){
		//console.log('q--l:',l,'r:',r,'x:',x,'y:',y,'i:',i);
		if(l === x && r === y){v[i] = t;return;}
		var m = x+y >> 1;
		if(m < r)
		  if(l < m){
			q(l,m,x,m,i+i+1);q(m,r,m,y,i+1<<1);
		  }
		  else
			q(l,r,m,y,i+1<<1);
		else
		  q(l,r,x,m,i+i+1);
	  }
	  //this.printing();
	},
	printing:function(){
	  console.log(this.seg[0]);
	  let s=[]; 
	  for(let i=1;i<=2;i++){
		s.push(this.seg[i]);
	  }
	  console.log(s.join(' '));
	  s=[];
	  for(let i=3;i<=6;i++){
		s.push(this.seg[i]);
	  }
	  console.log(s.join(' '));
	  s=[];
	  for(let i=7;i<=14;i++){
		s.push(this.seg[i]);
	  }
	  console.log(s.join(' '));
	},
  }
//コピペスペース//////////////////////
/////////////////////////////////////

function Main(input){
	let temp = input.trim().split('\n');
	let temp2 = mapint(temp[0]);
	let n = temp2.shift();
	let q = temp2.shift();

	let s = new Array(n);
	for(let i=1;i<=n;i++){
		s[i-1] = mapint(temp[i]);
	}

	let d = new Array(q);
	for(let i=1;i<=q;i++){
		d[i-1] = parseInt(temp[n+i]);
	}

	var st = new segTree(q);
	s.sort((a,b)=>b[2]-a[2]);
	for(var i = 0; i < n; i++){
	  if(s[i][1]-s[i][2]-1<d[0])continue;
	  var l = lower_bound(d,0,q,s[i][0]-s[i][2]);
	  var r = lower_bound(d,l,q,s[i][1]-s[i][2]);
	  if(l<r)st.update(l,r,s[i][2]);
	}
	var ans = Array(q);
	for(var i = 0; i < q; i++){
	  ans[i] = st.get(i);
	}
	console.log(ans.join("\n"));
	//st.printing();
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
