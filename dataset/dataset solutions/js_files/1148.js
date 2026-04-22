class LevenshteinDistance {
  // Verify: http://judge.u-aizu.ac.jp/onlinejudge/review.jsp?rid=4313161#1
  /**
   * 編集距離の DP 配列
   * _dist[v][w]: 入力文字列を v 文字、word を w 文字見たときの、それ以前の編集距離
   */

  constructor(word) {
    this._dist = [[...Array(word.length + 1)].map((_, i) => i)];
    this._prev = [[...Array(word.length + 1)].map((_, i) => [0, i - 1])];
    this._prev[0][0] = [-1, -1];
    this._word = word.split("");
    this._input = [];
  }

  /**
   * 入力の i 番目以降を suffix で置き換える。O(|word||suffix|)
   * @param {Number} i
   * @param {String} suffix
   */
  updateInputSuffix(i, suffix) {
    if (i > this._input.length) {
      throw new Error("入力の長さより後ろの位置が指定されました");
    }
    this._input.length = i;
    this._input.push(...suffix.split(""));

    this._dist.length = i + 1;
    for (let v = this._dist.length; v < this._input.length + 1; v++) {
      this._dist[v] = [...Array(this._word.length + 1)].map(() => Infinity);
      this._dist[v][0] = v;
      this._prev[v] = [...Array(this._word.length + 1)].map(() => [-1, -1]);
      this._prev[v][0] = [v - 1, 0];

      for (let w = 1; w < this._word.length + 1; w++) {
        this._updateDp({
          v,
          w,
          pv: v - 1,
          pw: w - 1,
          cost: this._input[v - 1] === this._word[w - 1] ? 0 : 1
        });
        this._updateDp({ v, w, pv: v, pw: w - 1, cost: 1 });
        this._updateDp({ v, w, pv: v - 1, pw: w, cost: 1 });
      }
    }
  }

  _updateDp(params) {
    const { v, w, pv, pw, cost } = params;
    if (this._dist[pv][pw] + cost < this._dist[v][w]) {
      this._dist[v][w] = this._dist[pv][pw] + cost;
      this._prev[v][w] = [pv, pw];
    }
  }

  /**
   * ワードと入力の文字ごとに正解かどうかを表す配列を構成する。O(|input|+|word|)
   */
  buildCorrections() {
    const inputCorrections = [...Array(this._input.length)].map(() => false);
    const wordCorrections = [...Array(this._word.length)].map(() => false);
    let v = this._input.length;
    let w = this._word.length;
    while (v > 0 || w > 0) {
      const [nv, nw] = this._prev[v][w];
      // コストがゼロの遷移ができたら正解
      if (this._dist[nv][nw] === this._dist[v][w]) {
        for (let i = nv; i < v; i++) inputCorrections[i] = true;
        for (let i = nw; i < w; i++) wordCorrections[i] = true;
      }
      [v, w] = [nv, nw];
    }
    return { input: inputCorrections, word: wordCorrections };
  }

  get dist() {
    return this._dist;
  }
}

const main = stdin => {
  const [word, input] = stdin.split("\n");
  const ld = new LevenshteinDistance(word);
  ld.updateInputSuffix(0, input);
  console.log(ld.dist[input.length][word.length]);
};
// 標準入力
main(require("fs").readFileSync("/dev/stdin", "utf8"));

