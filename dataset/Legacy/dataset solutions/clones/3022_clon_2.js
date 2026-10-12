var READ=(function(){function make(src){return new Parser(src);}function Parser(src){this._rows=src.trim().split("\n");this._pos=0;}Parser.prototype.a=function(raw){var rows=this._rows, pos=this._pos, out;if(typeof rows[pos]==="string")rows[pos]=rows[pos].split(" ").reverse();out=rows[pos].pop();if(!rows[pos].length)this._pos++;return raw?out:+out;};Parser.prototype.l=function(raw){var rows=this._rows[this._pos++].split(" ");return raw?rows:rows.map(v=>+v);};Parser.prototype.m=function(cnt,raw){var out=this._rows.slice(this._pos,this._pos+=cnt).map(v=>v.split(" "));return raw?out:out.map(v=>v.map(v=>+v));};Parser.prototype.r=function(cnt,raw){var out=this._rows.slice(this._pos,this._pos+=cnt);return raw?out:out.map(v=>+v);};return make;})();
var data=READ(require("fs").readFileSync("/dev/stdin","utf8"));
function makeArray(value){var args=arguments,len=args.length,res="Array(args["+--len+"]).fill(0).map(v=>{return "+value+";})";while(--len)res="Array(args["+len+"]).fill(0).map(v=>"+res+")";return eval(res);}
var MOD = 998244353;
function mulMod(){for(var args=arguments,res=args[0],idx=1;idx<args.length;)res=((res>>16)*args[idx]%MOD*65536+(res&65535)*args[idx++])%MOD;return res;}
function fastPow(base,exp){for(var res=1;exp;base=mulMod(base,base),exp>>=1)if(exp&1)res=mulMod(base,res);return res;}

console.log(run());
function run(){
  var count = data.a();
  var nums = data.r(count).sort((left,right)=>left-right);
  var total = nums.reduce((left,right)=>left+right);
  var table = [1];
  for(var i = 0; i < count; i++){
    var next = makeArray(0,table.length+nums[i]);
    for(var j = 0; j < table.length; j++){
      next[j] += table[j] * 2;
      next[j+nums[i]] += table[j];
      next[j] %= MOD;
    }
    table = next;
  }
  var answer = fastPow(3,count);
  if(total % 2 === 0)answer += halfSolve(nums,count,total/2);
  total = total+1 >> 1;
  for(var j = total; j < table.length; j++){
    answer -= table[j] * 3;
  }
  answer %= MOD;
  return (answer+MOD)%MOD;
}

function halfSolve(nums,count,target){
  var table = [1];
  for(var i = 0; i < count; i++){
    var next = makeArray(0,table.length+nums[i]);
    for(var j = 0; j < table.length; j++){
      next[j] += table[j];
      next[j+nums[i]] += table[j];
      next[j] %= MOD;
    }
    table = next;
  }
  return table[target] * 3;
}
