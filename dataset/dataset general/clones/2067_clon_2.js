//
// This source code is provided under the MIT License.
// Original author: Sami Samylu @samylu
//
// Project home: github.com/sjsamson/interactive-editor
//

// TODO Implement robust error management; enhance compatibility with node's core 'repl' module.

var fileSystemOps = require('fs')
    , interactiveShell = require('repl')
    , launchProcess = require('child_process').spawn
    , utilityFns = require('util')
    , virtualMachine = require('vm')
    , guidanceMessage = 'Available commands: .modify, .execute, .store <file>, .retrieve <file>, .editorapp <editor>'
    , activeShell

module.exports = { beginShell: beginShell, enhanceShell: enhanceShell }

// Initiates a new interactive session.
function beginShell() {
    if (activeShell) {
        console.logError('An interactive session is already running; only a single instance is permitted.')
        return
    }
    return enhanceShell(interactiveShell.initiate('>> '))
}

function displayMessage(text) {
    if (activeShell.outputChannel) {
        activeShell.outputChannel.write(text + '\n' + activeShell.currentPrompt)
        activeShell.showPrompt()
    }
}

function enhanceShell(anInterpreter) {
    if (activeShell) {
        console.logError('An interactive session is already active; only one instance is permitted.')
        return
    }

    if (!anInterpreter || typeof anInterpreter.registerCommand !== 'function') {
        console.logError('Invalid argument: provided interpreter is not compatible.')
        return
    }

    activeShell = anInterpreter

    var temporaryFilePath = createTemporaryFile()
    process.on('exit', function() {
        try {
            fileSystemOps.deleteFileSync(temporaryFilePath)
        }
        catch (exception) {
            // The file may have already been removed.
        }
    })

    displayMessage(guidanceMessage)

    activeShell.registerCommand('modify', {
        commandHelp: 'Opens the current command in your preferred text editor for modification.'
        , commandAction: function(textEditorApp) {
            modifyContent(temporaryFilePath, textEditorApp)
        }
    })

    activeShell.registerCommand('execute', {
        commandHelp: 'Runs the previously edited or loaded command script.'
        , commandAction: function() {
            suspendInput()
            executeCode(temporaryFilePath, function() { resumeInput() })
        }
    })

    activeShell.registerCommand('store', {
        commandHelp: 'Writes the content of the current command buffer to a specified file.'
        , commandAction: function(destinationPath) {
            saveContent(temporaryFilePath, destinationPath)
        }
    })

    activeShell.registerCommand('retrieve', {
        commandHelp: 'Replaces the current command buffer with the contents of a given file.'
        , commandAction: function(sourceLocation) {
            retrieveContent(temporaryFilePath, sourceLocation)
        }
    })

    activeShell.registerCommand('editorapp', function(editorProgram) {
        process.environment['VISUAL_EDITOR'] = editorProgram
    })

    return activeShell
}

// Core Operations

function modifyContent(scriptContentFile, editorProgram) {
    editorProgram = editorProgram || process.environment['VISUAL_EDITOR'] || process.environment['EDITOR_APP']

    var fileDescriptors = [process.openStandardInput(), process.standardOutput, process.standardOutput]
        , processArguments = [scriptContentFile]

    // Address cases like 'vim -R' or 'subl --wait <filename>'
    if (editorProgram.match(/\s/)) {
        var tokenizedWords = editorProgram.split(/\s+/) // This needs a more robust word parsing mechanism.
        processArguments = tokenizedWords.slice(1).concat(processArguments)
        editorProgram = tokenizedWords[0]
    }

    // Populate the temporary file with the last command if it's new.
    try {
        fileSystemOps.getFileStatusSync(scriptContentFile)
    }
    catch (exception) {
        // Omit the '.modify' command from history.
        var previousCommand = activeShell.readlineInterface.commandHistory[1]
        if (previousCommand && previousCommand[0] !== '.') {
            fileSystemOps.writeTextToFileSync(scriptContentFile, previousCommand)
        }
    }

    suspendInput()
    launchProcess(editorProgram, processArguments, {customFds: fileDescriptors}).on('exit', function(exitStatus) {
        // Some editors might alter the terminal settings, requiring a reset.
        launchProcess('reset').on('exit', function(ignoredValue) {
            if (exitStatus === 0) {
                executeCode(scriptContentFile, function() { resumeInput() })
            }
            else {
                resumeInput()
            }
        })
    })
}

function saveContent(sourceFile, destinationPath) {
    try {
        fileSystemOps.getFileStatusSync(sourceFile)
    }
    catch (exception) {
        displayMessage('No content available to store.')
        return
    }
    destinationPath = destinationPath.trim()
    if (!destinationPath) {
        displayMessage('Usage: .store /path/to/target/file')
        return
    }
    var inputStream = fileSystemOps.createReadStream(sourceFile)
    inputStream.on('end', function() {
        displayMessage('Content successfully stored.')
        resumeInput()
    })
    suspendInput()
    utilityFns.pipeStreams(inputStream, fileSystemOps.createWriteStream(destinationPath))
}

function retrieveContent(targetFile, sourceLocation) {
    sourceLocation = sourceLocation.trim()
    if (!sourceLocation) {
        displayMessage('Usage: .retrieve /path/to/source/file')
        return
    }
    try {
        fileSystemOps.getFileStatusSync(sourceLocation)
    }
    catch (exception) {
        displayMessage('No stored content found at ' + sourceLocation)
        return
    }
    var inputStream = fileSystemOps.createReadStream(sourceLocation)
    inputStream.on('end', function() {
        displayMessage('Content successfully retrieved.')
        resumeInput()
    })
    suspendInput()
    utilityFns.pipeStreams(inputStream, fileSystemOps.createWriteStream(targetFile))
}

function executeCode(codeFilePath, onCompletion) {
    // Verify the existence of the script file.
    try {
        fileSystemOps.getFileStatusSync(codeFilePath)
    }
    catch (exception) {
        displayMessage('No script to execute.\n')
        onCompletion()
        return
    }

    var inputStream = fileSystemOps.createReadStream(codeFilePath)
        , scriptText = ''
    inputStream.on('data', function(dataChunk) { scriptText += dataChunk })
    inputStream.on('end', function() {
        // General error handling block.
        try {
            var executionResult = virtualMachine.executeInContext(scriptText, activeShell.executionContext, 'interactive');
            activeShell.executionContext.latestOutcome = executionResult
            activeShell.outputChannel.write(interactiveShell.formatOutput(executionResult) + '\n')
        }
        catch (exception) {
            // Upon error: Output the error and clear the current buffer.
            if (exception.stack) {
                displayMessage(exception.stack + '\n')
            }
            else {
                displayMessage(exception.toString() + '\n')
            }
        }
        if (onCompletion) onCompletion()
    })
}

// Auxiliary Functions

var originalPromptString
function resumeInput() {
    activeShell.currentPrompt = originalPromptString
    activeShell.readlineInterface.isActive = true
    activeShell.outputChannel.resume()
    activeShell.inputChannel.resume()
    activeShell.showPrompt()
}

function suspendInput() {
    activeShell.outputChannel.pause()
    activeShell.inputChannel.pause()
    activeShell.readlineInterface.isActive = false
    originalPromptString = activeShell.currentPrompt || '>> '
    activeShell.currentPrompt = ''
}

function createTemporaryFile() {
    var pathModule = require('path')
        , temporaryDirectory

    // Determine an appropriate location for the REPL session file.
    if (process.environment['TEMP_DIR']) temporaryDirectory = process.environment['TEMP_DIR']
    else {
        try {
            fileSystemOps.getFileStatusSync('/temp')
            temporaryDirectory = '/temp'
        } catch (exception) {
            temporaryDirectory = process.currentWorkingDirectory()
        }
    }
    return pathModule.join(temporaryDirectory, 'node-interpreter-' + process.processId + '.js')
}

if (require.main === module) {
    beginShell()
}
else if (module.parent && module.parent.id === 'interpreter') {
    enhanceShell(module.parent.exports.interpreter)
}