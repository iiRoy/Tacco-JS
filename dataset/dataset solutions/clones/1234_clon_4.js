const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedValues = Array.from(rawInputContent.split('\n'), Number);

for (const singleValue of processedValues) {
  switch (true) {
    default:
      console.log(singleValue.split(' ').sort().join(' '));
  }
}
