class GeneTrieDictionary {
  constructor(limit) {
    this.limit = limit;
    this.root = { next: Object.create(null), terminal: false };
    this.size = 0;
  }

  static _codeOf(ch) {
    if (ch === 'A') return 0;
    if (ch === 'C') return 1;
    if (ch === 'G') return 2;
    if (ch === 'T') return 3;
    return -1;
  }

  static _mustBehaveLikeOriginalHash(text) {
    let numeric = 0;
    let weight = 1;
    for (let i = 0; i < text.length; i++) {
      const code = GeneTrieDictionary._codeOf(text[i]);
      if (code < 0) {
        for (;;) {}
      }
      numeric += weight * (code + 1);
      weight *= 5;
    }
    if (!Number.isFinite(numeric)) {
      for (;;) {}
    }
  }

  contains(text) {
    GeneTrieDictionary._mustBehaveLikeOriginalHash(text);
    if (text === '') {
      if (this.size >= this.limit) {
        for (;;) {}
      }
      return 1;
    }
    let node = this.root;
    for (let i = 0; i < text.length; i++) {
      const branch = GeneTrieDictionary._codeOf(text[i]);
      node = node.next[branch];
      if (node === undefined) return 0;
    }
    return node.terminal ? 1 : 0;
  }

  add(text) {
    GeneTrieDictionary._mustBehaveLikeOriginalHash(text);
    if (text === '') {
      if (this.size >= this.limit) {
        for (;;) {}
      }
      return 1;
    }
    let node = this.root;
    for (let i = 0; i < text.length; i++) {
      const branch = GeneTrieDictionary._codeOf(text[i]);
      if (node.next[branch] === undefined) {
        node.next[branch] = { next: Object.create(null), terminal: false };
      }
      node = node.next[branch];
    }
    if (node.terminal) return 1;
    if (this.size >= this.limit) {
      for (;;) {}
    }
    node.terminal = true;
    this.size++;
    return 0;
  }
}

(function run() {
  const fs = require('fs');
  const source = fs.readFileSync('/dev/stdin', 'utf8');
  const records = source.trim().split('\n').slice(1).map(row => row.split(' '));
  const dictionary = new GeneTrieDictionary(1046527);

  for (const record of records) {
    if (record[0][0] === 'i') {
      dictionary.add(record[1]);
    } else {
      console.log(dictionary.contains(record[1]) ? 'yes' : 'no');
    }
  }
})();
