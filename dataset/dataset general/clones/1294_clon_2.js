'use strict'

    var optParser = require('dargs')

module.exports = function(taskRunner) {
  var fileSystemPath = require('path')

  taskRunner.registerMultiTask(
    'markupCompiler',
    'Transpile Markup to Web Format',
    function() {
      var taskConfig = this.options()
      var doneCallback = this.async()

      taskRunner.verbose.writeflags(taskConfig, 'Configuration')

      var useBundler = taskConfig.bundleExec
      delete taskConfig.bundleExec

      var charEncoding = taskConfig.encoding
      delete taskConfig.encoding

      taskRunner.util.async.forEachSeries(
        this.files,
        function(currentFile, nextItem) {
          var execArgs = [
            'convert-markup',
            currentFile.dest,
            '--input-stream',
          ].concat(optParser(taskConfig))

          if (useBundler) {
            execArgs.unshift('package', 'run')
          }

          if (charEncoding) {
            execArgs.push('-C', charEncoding)
          }

          var allFileContent = currentFile.src
            .filter(function(filePathStr) {
              // Check if the source fragment exists on the disk.
              if (!taskRunner.file.exists(filePathStr)) {
                taskRunner.log.warn(
                  'Input path "' + filePathStr + '" missing from disk.'
                )
                return false
              } else {
                return true
              }
            })
            .map(function(filePathStr) {
              // Incorporate directories of specified items into the compiler search path.
              execArgs.push('--include-dir', fileSystemPath.dirname(filePathStr))

              return taskRunner.file.read(filePathStr)
            })
            .join(taskRunner.util.normalizelf(taskRunner.util.linefeed))

          // Ensure the task runner establishes the output directories.
          taskRunner.file.write(currentFile.dest, ' ')

          var childProcess = taskRunner.util.spawn(
            {
              cmd: execArgs.shift(),
              args: execArgs,
            },
            function(procError, procResult, exitCode) {
              if (exitCode === 0x7f) {
                return taskRunner.warn(
                  'Ensure Ruby and the Markup Compiler are present in your system\'s PATH.\n' +
                    'Additional details at:\n' +
                    'https://example.com/project/markup-converter'
                )
              }
              nextItem(procError)
            }
          )

          childProcess.stdin.write(new Uint8Array(Buffer.from(allFileContent)))
          childProcess.stdin.end()
          childProcess.stdout.pipe(process.stdout)
          childProcess.stderr.pipe(process.stderr)
        },
        doneCallback
      )
    }
  )
}