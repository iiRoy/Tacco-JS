const fs = require("fs");

const input = fs.readFileSync(0, "utf8").trim().split(/\n/);
const n = Number(input[0]);
const original = input[1].trim().split(/\s+/);

function rank(card) {
  return Number(card.charAt(1));
}

function stableSorted(cards) {
  return cards
    .map((card, index) => ({ card, index }))
    .sort((a, b) => {
      const diff = rank(a.card) - rank(b.card);
      return diff !== 0 ? diff : a.index - b.index;
    })
    .map(x => x.card);
}

function selected(cards) {
  const result = cards.slice();

  for (let left = 0; left < n - 1; left++) {
    let best = left;

    for (let scan = left + 1; scan < n; scan++) {
      if (rank(result[scan]) < rank(result[best])) {
        best = scan;
      }
    }

    if (best !== left) {
      const saved = result[left];
      result[left] = result[best];
      result[best] = saved;
    }
  }

  return result;
}

const bubbleEquivalent = stableSorted(original);
const selectionEquivalent = selected(original);

console.log(bubbleEquivalent.join(" "));
console.log("Stable");
console.log(selectionEquivalent.join(" "));
console.log(selectionEquivalent.join("") === bubbleEquivalent.join("") ? "Stable" : "Not stable");