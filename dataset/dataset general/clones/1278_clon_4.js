const fileOperations = require('fs');
const codeOptimizer = require('terser');

const sourcePath = 'readmore.js';
const destinationPath = 'readmore.min.js';

try {
  const rawContent = fileOperations.readFileSync(sourcePath, 'utf8');

  const optimizationOutcome = codeOptimizer.minify(rawContent, {
    mangle: true,
    compress: true,
    format: {
      comments: 'some',
    },
  });

  if (optimizationOutcome.error) {
    throw optimizationOutcome.error;
  }

  fileOperations.writeFileSync(destinationPath, optimizationOutcome.code, 'utf8');
} catch (processingIssue) {
  process.exit(1);
}