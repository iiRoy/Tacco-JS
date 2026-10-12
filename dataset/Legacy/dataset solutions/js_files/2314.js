/**
 * @param input string[]
 */
function Main(input) {
  /** @type number[] */
  const input0Numbered = input[0].split(' ').map(Number);
  const N = input0Numbered[0];
  const M = input0Numbered[1];
  const V = input0Numbered[2];
  const P = input0Numbered[3];
  /**
   * 昇順ソートしたもの
   * @type number[]
   */
  const alist = input[1].split(' ').map(Number).sort((v1, v2) => v1 - v2);

  /**
   * まず、昇順ソート
   * 1. 配列の最小数Kの重複分を配列から抜いて投票可能数もその分減らす
   * 2. 投票数 -= 1 ... Kに全票を入れるため
   * 3. KにM票入れた結果K2より少ない数がK以降にあれば、その差を抜いていく。その合計がMになったらv-=1これを繰り返し、余った分をRとする
   * 4. 配列の最後からv番目の数にM-Rを足した数がK2以下であれば5へ、それ以外は配列からKを抜いて1に戻る
   * 5. P位以内になれるものが見つかったら、それより少ない数を引いた問題数が結果となる
   */

  v = V;
  var ai, ai2, aj, r, j, reducedV, max = null;
  // 選ばれるための最小スコアを検索
  for (var i = 0; i < alist.length; i++) {
    // この問題と同等のスコアのものに投票していく
    while (alist[i] === alist[i + 1]) {
      i++;
      v--;
    }
    v--;
    // この問題の点数
    ai = alist[i];
    // この問題の最大点数
    ai2 = ai + M;

    r = 0;
    // aiより大きいもののうち、ai2より小さいものに順に投票していく
    for (j = i + 1; alist[j] < k2; j++) {
      r += k2 - alist[j];
    }
    reducedV = Math.floor(r / M);
    r = r % M;

    if (v <= reducedV) {
      // この時点ですべて投票済みならすべてにおいて最大となるため終了
      max = ai;
      break;
    }

    // この時点で v < alist.length - (i + 1)

    // 残りはすべてスコアが大きい順に投票
    voteds = alist.slice(-(v - reducedV)).map((aj) => aj + M);
    // 部分的に投票済みならそのうち最も少ない数から引いていく
    if (r > 0) {
      for (j = 0; j < voteds.length; j++) {
        aj = voteds[j];
        // ai2より少なくなる場合、同じ数になるまで引く
        if (aj - r < ai2) {
          voteds[j] = ai2;
          r -= aj - ai2;
        } else {
          voteds[j] -= r;
          r = 0;
          break;
        }
      }

      if (r > 0) {
        voteds[voteds.length - 1] -= r;
      }
    }

    for (k = 0; k < P; k++) {
      cmp = (k < veteds.length)
        ? veteds[veteds.length - k - 1]
        : alist[alist.length - k - 1];

      if (ai2 >= cmp) {
        max = ai;
        break;
      }
    }
    if (max) {
      break;
    }
  }

  // 最小値のインデックに戻す
  for (; i > 0; i--) {
    if (alist[i] !== alist[i - 1]) {
      break;
    }
  }

  answer = alist.length - i;

  console.log(answer);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));