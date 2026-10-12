class ACGTHashList {
  static get MAP() {
    return {
      'A': 1,
      'C': 2,
      'G': 3,
      'T': 4,
    }
  }

  constructor(M) {
    this.M = M;
    this.H = [];
    for (let i = 0; i < M; i++) this.H[i] = '';
  }

 static _getKey(str) {
   let sum = 0;
   let p = 1;
   for (let i = 0, p = 1; i < str.length; i++, p *= 5) sum += p * ACGTHashList.MAP[str[i]];
   return sum;
 }

 _h1(key) { return key % this.M;}

 _h2(key) { return 1 + key % (this.M - 1);}

 find(str) {
   let key = ACGTHashList._getKey(str);
   let h;
   const h1 = this._h1(key), h2 = this._h2(key);
   for (let i = 0;; i++) {
     h = (h1 + i * h2) % this.M;
     if (this.H[h] === str) return 1;
     else if (this.H[h] === '') return 0;
   }
   return 0;
 }

 insert(str) {
   let key = ACGTHashList._getKey(str);
   let h;
   const h1 = this._h1(key), h2 = this._h2(key);
   for (let i = 0;; i++) {
     h = (h1 + i * h2) % this.M;
     if (this.H[h] === str) return 1;
     else if (this.H[h] === '') {
       this.H[h] = str;
       return 0;
     }
   }
   return 0;
 }

}

(function main(){
  const lines = require('fs').readFileSync('/dev/stdin', 'utf8');
  var Arr=(lines.trim()).split("\n").slice(1);
  const commands = Arr.map(l => l.split(' '));

  let hl = new ACGTHashList(1046527);
  commands.forEach(cmd => {
    if (cmd[0][0] === 'i') {
      hl.insert(cmd[1]);
    } else {
      console.log(hl.find(cmd[1]) ? 'yes' : 'no');
    }
  });
})();

