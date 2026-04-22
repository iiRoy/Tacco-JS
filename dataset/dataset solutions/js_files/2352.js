function Main(input) {
  const lines = input.split("\n");
  const n = +lines[0];
  const rest = lines.slice(1);

  const rules = [];
  var ai, rule;
  var i, j, honestFlags;
  for (i = 0; i < rest.length; i++) {
    ai = +rest[i];
    rule = [];
    for (j = 1; j <= ai; j++) {
      rule.push(rest[i + j].split(' ').map(Number));
    }
    rules.push(rule);
    i += ai;
  }

  var answer = 0, honestsCount;
  // bit全探索
  for (honestFlags = Math.pow(2, n) - 1; honestFlags > 0; honestFlags--) {
    honestsCount = countHonests(honestFlags);

    // 正直者の数がこれまでの最大値より少なければ検証しない
    if (honestsCount <= answer) {
      continue;
    }

    // 矛盾がないかどうか確認
    if (rules.every((rule, i) => {
      // 証言者が正直者かどうか
      const isHonest = (honestFlags >> i) % 2;

      // i人目の証言に矛盾がないか確認
      return rule.every((r) => {
        const xij = r[0];
        const yij = r[1];
        // xij人目が正直者かどうか
        const xijFlag = (honestFlags >> (xij - 1)) % 2;

        return isHonest
          // 証言者が正直者なら一致
          ? (yij === xijFlag)
          // 正直者でなければ不一致
          : (yij !== xijFlag);
      });
    })) {
      answer = honestsCount;
    }
  }

  //出力
  console.log(answer);
}

/**
 * ビットフラグ中の正直者の数をカウント
 * @param {number} honestFlags 正直者ビットフラグ
 */
function countHonests(honestFlags) {
  var tmpHonestFlags = honestFlags;
  var count = 0;
  while (tmpHonestFlags > 0) {
    if (tmpHonestFlags % 2) {
      count++;
    }
    tmpHonestFlags = tmpHonestFlags >> 1;
  }

  return count;
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());