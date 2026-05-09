import { execFile } from 'child_process';
import { promises as fileSystemPromises } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const currentModulePath = dirname(fileURLToPath(import.meta.url));

import compilerKit from '../lib/flex.js';

const runProcessAsynchronously = promisify(execFile);

const purgePathEntry = async (itemLocation) => {
  try {
    await fileSystemPromises.unlink(itemLocation);
  } catch (operationError) {
    if (operationError.code !== 'ENOENT') {
      console.error(`Deletion issue for ${itemLocation}:`, operationError);
    }
  }
};

const checkPathExistence = async (itemLocation) => {
  try {
    await fileSystemPromises.access(itemLocation);
    return true;
  } catch {
    return false;
  }
};

const ascertainDirectoryStatus = async (itemLocation) => {
  try {
    const fileStats = await fileSystemPromises.stat(itemLocation);
    return fileStats.isDirectory();
  } catch {
    return false;
  }
};

const ascertainFileStatus = async (itemLocation) => {
  try {
    const fileStats = await fileSystemPromises.stat(itemLocation);
    return fileStats.isFile();
  } catch {
    return false;
  }
};

const formulateCompilerCommand = (compilerBinaryPath, sourceFileSpec, configurationName = 'air') => {
  const compilerArguments = [`+configname=${configurationName}`, sourceFileSpec];
  let executionCommand = compilerBinaryPath;
  let finalArguments = compilerArguments;

  if (process.platform !== 'win32') {
    finalArguments = [compilerBinaryPath, ...compilerArguments];
    executionCommand = '/bin/sh';
  }
  return { command: executionCommand, args: finalArguments };
};

describe('Flex SDK Toolchain Validation', () => {

  it('should verify SDK binary directory and tool availability', async () => {
    expect(compilerKit.binDir).toBeDefined();
    expect(await checkPathExistence(compilerKit.binDir)).toBe(true);
    expect(await ascertainDirectoryStatus(compilerKit.binDir)).toBe(true);
    expect(compilerKit.bin).toBeDefined();
    expect(Object.keys(compilerKit.bin).length).toBeGreaterThan(0);
    expect(compilerKit.bin.mxmlc).toBeDefined();
    expect(await checkPathExistence(compilerKit.bin.mxmlc)).toBe(true);
    expect(await ascertainFileStatus(compilerKit.bin.mxmlc)).toBe(true);
  });

  describe('Successful Compilation Test Case', () => {
    const compiledOutputArtifact = join(currentModulePath, 'testData', 'testApp.swf');
    const sourceInputScript = join(currentModulePath, 'testData', 'testApp.as');

    beforeEach(async () => {
      await purgePathEntry(compiledOutputArtifact);
    });

    afterEach(async () => {
      await purgePathEntry(compiledOutputArtifact);
    });

    it('should successfully compile a valid ActionScript source file', async () => {
      expect(compilerKit.bin.mxmlc).toBeDefined();
      expect(await checkPathExistence(compilerKit.bin.mxmlc)).toBe(true);
      expect(await checkPathExistence(sourceInputScript)).toBe(true);

      const { command, args } = formulateCompilerCommand(compilerKit.bin.mxmlc, sourceInputScript);

      let executionError = null;
      let standardOutput = '';
      let errorOutput = '';

      try {
        const result = await runProcessAsynchronously(command, args);
        standardOutput = result.stdout;
        errorOutput = result.stderr;
      } catch (err) {
        executionError = err;
        standardOutput = err.stdout || '';
        errorOutput = err.stderr || '';
      }

      expect(executionError).toBeNull();

      const combinedOutputLower = (standardOutput + errorOutput).toLowerCase();
      const noFailureIndicators = !combinedOutputLower.includes('fail');
      const noErrorIndicators = !combinedOutputLower.includes('error');

      let artifactPathPresentInOutput;
      if (process.platform === 'win32') {
        artifactPathPresentInOutput = combinedOutputLower.replace(/\\/gi, '/').includes(compiledOutputArtifact.toLowerCase().replace(/\\/gi, '/'));
      } else {
        artifactPathPresentInOutput = combinedOutputLower.includes(compiledOutputArtifact);
      }

      expect(noFailureIndicators).toBe(true);
      expect(noErrorIndicators).toBe(true);
      expect(artifactPathPresentInOutput).toBe(true);
      expect(await checkPathExistence(compiledOutputArtifact)).toBe(true);
    });
  });

  describe('Compilation Failure due to Syntax Issues', () => {
    const compiledOutputArtifact = join(currentModulePath, 'testData', 'errorApp.swf');
    const sourceInputScript = join(currentModulePath, 'testData', 'errorApp.as');

    beforeEach(async () => {
      await purgePathEntry(compiledOutputArtifact);
    });

    afterEach(async () => {
      await purgePathEntry(compiledOutputArtifact);
    });

    it('should report an error when ActionScript source contains syntax errors', async () => {
      expect(compilerKit.bin.mxmlc).toBeDefined();
      expect(await checkPathExistence(compilerKit.bin.mxmlc)).toBe(true);
      expect(await checkPathExistence(sourceInputScript)).toBe(true);

      const { command, args } = formulateCompilerCommand(compilerKit.bin.mxmlc, sourceInputScript);

      let executionError = null;
      let standardOutput = '';
      let errorOutput = '';

      try {
        await runProcessAsynchronously(command, args);
      } catch (err) {
        executionError = err;
        standardOutput = err.stdout || '';
        errorOutput = err.stderr || '';
      }

      expect(executionError).not.toBeNull();

      const combinedOutputLower = (standardOutput + errorOutput).toLowerCase();
      const failureOrErrorIndicatorsPresent = combinedOutputLower.includes('fail') || combinedOutputLower.includes('error');

      let artifactPathPresentInOutput;
      if (process.platform === 'win32') {
        artifactPathPresentInOutput = combinedOutputLower.includes(compiledOutputArtifact.toLowerCase());
      } else {
        artifactPathPresentInOutput = combinedOutputLower.includes(compiledOutputArtifact);
      }

      expect(failureOrErrorIndicatorsPresent).toBe(true);
      expect(artifactPathPresentInOutput).toBe(false);
      expect(await checkPathExistence(compiledOutputArtifact)).toBe(false);
    });
  });

  describe('Compilation Failure due to Non-Existent Source', () => {
    const compiledOutputArtifact = join(currentModulePath, 'testData', 'nonExistentApp.swf');
    const sourceInputScript = join(currentModulePath, 'testData', 'nonExistentApp.as');

    beforeEach(async () => {
      await purgePathEntry(compiledOutputArtifact);
    });

    afterEach(async () => {
      await purgePathEntry(compiledOutputArtifact);
    });

    it('should fail compilation if the specified source file does not exist', async () => {
      expect(compilerKit.bin.mxmlc).toBeDefined();
      expect(await checkPathExistence(compilerKit.bin.mxmlc)).toBe(true);
      expect(await checkPathExistence(sourceInputScript)).toBe(false);

      const { command, args } = formulateCompilerCommand(compilerKit.bin.mxmlc, sourceInputScript);

      let executionError = null;
      let standardOutput = '';
      let errorOutput = '';

      try {
        await runProcessAsynchronously(command, args);
      } catch (err) {
        executionError = err;
        standardOutput = err.stdout || '';
        errorOutput = err.stderr || '';
      }

      expect(executionError).not.toBeNull();

      const combinedOutputLower = (standardOutput + errorOutput).toLowerCase();
      const failureOrErrorIndicatorsPresent = combinedOutputLower.includes('fail') || combinedOutputLower.includes('error');

      let artifactPathPresentInOutput;
      if (process.platform === 'win32') {
        artifactPathPresentInOutput = combinedOutputLower.includes(compiledOutputArtifact.toLowerCase());
      } else {
        artifactPathPresentInOutput = combinedOutputLower.includes(compiledOutputArtifact);
      }

      expect(failureOrErrorIndicatorsPresent).toBe(true);
      expect(artifactPathPresentInOutput).toBe(false);
      expect(await checkPathExistence(compiledOutputArtifact)).toBe(false);
    });
  });
});