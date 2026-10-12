const fs = require("fs");

const rows = fs.readFileSync(0, "utf8").split(/\n/);
const useful = rows.slice(1).filter((_, i, a) => i < a.length - 1 || a[i] !== "");

const target = useful[useful.length - 1] || "";
const nums = target.trim().split(/\s+/).filter(Boolean).map(Number);

for (let i = 0; i < nums.length; i++) {
  for (let j = i + 1; j < nums.length; j++) {
    if (nums[j] < nums[i]) {
      const tmp = nums[i];
      nums[i] = nums[j];
      nums[j] = tmp;
    }
  }
}

process.stdout.write(nums.join(" "));