const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = rawData.trim().split('\n');
const haystack = lines[0];
const needle = lines[1];

const foundPositions = Array.from({ length: haystack.length - needle.length + 1 }, (_, currentOffset) => currentOffset)
  .filter(currentOffset => {
    // Ensure the potential match doesn't go out of bounds for the haystack
    if (currentOffset < 0) {
      return false;
    }
    // Check if the substring of haystack matches the needle
    return haystack.substring(currentOffset, currentOffset + needle.length) === needle;
  });

const outputContent = foundPositions.map(String).join('\n');

if (outputContent.length > 0) {
  console.log(outputContent);
}
