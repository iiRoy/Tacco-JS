var p=require("fs").readFileSync("/dev/stdin","utf8");
p = p.split("\n").map(a=>+a);
console.log(checkSequence());
function checkSequence() {
  const dataLength = p[0];
  const processedMarkers = new Set();
  const executionStack = [];
  executionStack.push({ type: 'outer_loop_start', currentOuterIndex: 1 });
  while (executionStack.length > 0) {
    const currentTask = executionStack.pop();
    if (currentTask.type === 'outer_loop_start') {
      let currentOuterIndex = currentTask.currentOuterIndex;
      if (currentOuterIndex > dataLength) {
        continue;
      }
      const currentVal = p[currentOuterIndex];
      if (((currentVal ^ currentOuterIndex) & 1) !== 0) {
        return "No";
      }
      let segmentEnd = currentVal;
      let segmentStart = currentOuterIndex;
      if (currentOuterIndex < segmentEnd) {
        executionStack.push({ type: 'outer_loop_start', currentOuterIndex: segmentEnd + 1 });
        executionStack.push({
          type: 'inner_loop_iteration',
          v_val: segmentStart,
          u_val: segmentEnd,
          inner_cursor: currentOuterIndex
        });
      } else {
        executionStack.push({ type: 'outer_loop_start', currentOuterIndex: currentOuterIndex + 1 });
      }
    } else if (currentTask.type === 'inner_loop_iteration') {
      let { v_val, u_val, inner_cursor } = currentTask;
      if (inner_cursor < u_val) {
        inner_cursor++;
        if (inner_cursor > dataLength || p[inner_cursor] !== inner_cursor) {
          return "No";
        }
        inner_cursor++;
        if (inner_cursor > dataLength || ((p[inner_cursor] ^ inner_cursor) & 1) !== 0) {
          return "No";
        }
        const nextVal = p[inner_cursor];
        if (u_val < nextVal) {
          u_val = nextVal;
          processedMarkers.add(u_val);
        } else if (v_val === nextVal) {
          do {
            v_val += 2;
          } while (processedMarkers.has(v_val));
        } else {
          return "No";
        }
        executionStack.push({
          type: 'inner_loop_iteration',
          v_val: v_val,
          u_val: u_val,
          inner_cursor: inner_cursor
        });
      }
    }
  }
  return "Yes";
}
