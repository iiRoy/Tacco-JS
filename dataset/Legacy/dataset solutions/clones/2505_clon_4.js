function execute(data) {
  const records = data.split("\n");
  if (records[records.length - 1] === "") {
    records.pop();
  }

  const total = records[0].split(" ")[0] - 0;
  const pieces = records[1].split(" ");

  const bucket = new Map();
  const singles = [];
  for (let position = 0; position < pieces.length; position++) {
    const item = pieces[position] - 0;

    if (item === 0) {
      continue;
    }

    if (Number.isNaN(item)) {
      singles.push(1);
      continue;
    }

    bucket.set(item, (bucket.get(item) || 0) + 1);
  }

  const sizes = Array.from(bucket.values()).concat(singles);
  sizes.sort((left, right) => {
    return left - right;
  });

  const prefix = [0];
  for (let index = 0; index < sizes.length; index++) {
    prefix[index + 1] = prefix[index] + sizes[index];
  }

  let answers = [];
  for (let width = 1; width <= total; width++) {
    const usable = sizes.length - width + 1;
    const cap = usable > 0 ? prefix[usable] : 0;
    answers.push(Math.min(Math.floor(total / width), cap * width));
  }

  console.log(answers.join("\n"));
}

execute(require("fs").readFileSync("/dev/stdin", "utf8"));
