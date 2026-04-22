const fileSystem = require('fs');
const pathResolver = require('path');
const fileFinder = require('glob');
const zipPacker = require('archiver');

const projectBaseLocation = pathResolver.resolve(__dirname, '..');
const sourceAssetFolder = pathResolver.join(projectBaseLocation, 'src');
const outputBuildFolder = pathResolver.join(projectBaseLocation, 'out');
const finalProductArchive = pathResolver.join(outputBuildFolder, 'extension.zip');

const assetInclusionPatterns = [
  '*.js',
  '*.png',
  '*.html',
  '*.json'
];

async function orchestrateArchivingProcess() {
  try {
    await fileSystem.promises.mkdir(outputBuildFolder, { recursive: true });

    const archiveWriteStream = fileSystem.createWriteStream(finalProductArchive);
    const archiveInstance = zipPacker('zip', {
      zlib: { level: 9 }
    });

    archiveWriteStream.on('close', () => {
      console.log(`Archiving completed. Total size: ${archiveInstance.pointer()} bytes`);
      console.log(`Archive saved to: ${finalProductArchive}`);
    });

    archiveInstance.on('warning', (archiveIssue) => {
      if (archiveIssue.code === 'ENOENT') {
        console.warn('Archiver warning: File not found during archiving:', archiveIssue);
      } else {
        throw archiveIssue;
      }
    });

    archiveInstance.on('error', (archiveProblem) => {
      throw archiveProblem;
    });

    archiveInstance.pipe(archiveWriteStream);

    let collectedFilesForArchive = [];
    for (const currentPattern of assetInclusionPatterns) {
      const discoveredFiles = await new Promise((resolve, reject) => {
        fileFinder(currentPattern, { cwd: sourceAssetFolder, absolute: true }, (error, filesList) => {
          if (error) reject(error);
          else resolve(filesList);
        });
      });
      collectedFilesForArchive = collectedFilesForArchive.concat(discoveredFiles);
    }

    const uniqueFilesToProcess = [...new Set(collectedFilesForArchive)];

    if (uniqueFilesToProcess.length === 0) {
      console.log('No eligible files found for archiving. An empty archive will be created.');
    }

    for (const singleFilePath of uniqueFilesToProcess) {
      const relativePathWithinArchive = pathResolver.relative(sourceAssetFolder, singleFilePath);
      archiveInstance.file(singleFilePath, { name: relativePathWithinArchive });
    }

    await archiveInstance.finalize();

  } catch (operationError) {
    console.error('An unrecoverable error occurred during the archiving operation:', operationError);
    process.exit(1);
  }
}

orchestrateArchivingProcess();