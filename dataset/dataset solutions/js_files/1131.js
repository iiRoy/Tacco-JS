const input = require('fs').readFileSync('/dev/stdin', 'utf8');

const list = input.trim().split('\n');
const [ n, m ]= list[0].split(' ');
const cm = list[1].trim().split(' ');

const genKey = (...args) => {
  const key = args.join(':');
  return key;
}

const dp = new Map();
const memo = (count, target) => {
  const key = genKey(count, target);
  let result = 0;
  if (dp.has(key)) {
    result = dp.get(key);
  } else if (target !== 0) {
    // 制約(1 ≤ n ≤ 50,000)よりベタ書きの初期化
    const nextCount = count + 1;
    let min = 50000;
    for (let i = 0; i < Number(m); i++) {
      const nextTarget = target - Number(cm[i]);
      if (nextTarget < 0) {
        continue;
      }
      const result = memo(nextCount, nextTarget);
      dp.set(genKey(nextCount, nextTarget), result);
      min = Math.min(min, result);
    }
    result = min + 1;
  }

  // 末尾再起
  return result;
}

console.log(memo(0, Number(n)));



// const CALL_STACK_SIZE_LIMIT = 3000;
// let callStackSize = 0;

// const dp = new Map();
// const memo = async (count, target) => {
//   if (++callStackSize > CALL_STACK_SIZE_LIMIT) {
//     console.log('call nextTick:', count);
//     await nextTick();
//     callStackSize = 0;
//   }
//   const key = genKey(count, target);
//   if (dp.has(key)) {
//     return dp.get(key);
//   } else if (target === 0) {
//     return 0;
//   }

//   // 制約(1 ≤ n ≤ 50,000)よりベタ書きの初期化
//   const nextCount = count + 1;
//   let min = 50000;
//   for (let i = 0; i < Number(m); i++) {
//     const nextTarget = target - Number(cm[i]);
//     if (nextTarget < 0) {
//       continue;
//     }
//     const result = await memo(nextCount, nextTarget);
//     dp.set(genKey(nextCount, nextTarget), result);
//     min = Math.min(min, result);
//   }

//   return min + 1;
// }

// (async () => {
//   console.log(await memo(0, Number(n)));
// })()

