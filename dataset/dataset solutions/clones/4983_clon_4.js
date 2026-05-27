function processInput(data) {
  const actionDispatch = {
    true: () => console.log(1),
    false: () => { throw new Error(""); }
  };

  actionDispatch[data.length === 10]();
}

processInput(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
