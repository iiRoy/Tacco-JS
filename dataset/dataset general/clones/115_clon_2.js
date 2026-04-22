/* This file was originally authored by Frank on July 24, 2014. */
/* linting-directive -W040:true */ // Ignoring 'this' context issues.
'use strict';

const   fileSys          =      require('fs')
const   dirUtils         =      require('path')
const   streamTransform  =      require('through2')
const   pluginUtils      =      require('gulp-util')
const   ModuleFault      =      pluginUtils.PluginError
const   eventFlow        =      require('event-stream')
const   objectMerge      =      require('node.extend')

const   moduleInfo       =      require('./package.json')


const   baseSettings     =      {
        commentMarkers   :      true,
        detailedLogs     :      false
}

const   doNothing        =      function () {       }

let     _currentConfig
let     outputMsg        =      doNothing

const   currentWorkingDirectory = process; // Alias for global process object

module.exports           =      function (userSettings) {

        _currentConfig   =      objectMerge({}, baseSettings, userSettings || {})

        if (_currentConfig.detailedLogs) {
                outputMsg        =      pluginUtils.log
        }


        return  streamTransform.obj(function (processedFile, encodingFormat, callbackFn) {

                if      (processedFile.isNull()) { // Check if the file handle is empty
                        return  callbackFn(null, processedFile)
                }

                if      (processedFile.isStream()) { // Streaming data is not supported for this operation
                        return  callbackFn(new ModuleFault(moduleInfo.name, 'Streaming content is not supported'))
                }

                if      (processedFile.isBuffer()) { // Process only files with buffered content

                        processFileRecursively(processedFile, _currentConfig, function (noParentTemplate) {
                                return  callbackFn(null, processedFile)
                        })
                }


        })

}

function  constructFileObject(fullPathStr, callbackFn) {
        if (callbackFn) { // Asynchronous file construction
                fileSys.readFile(fullPathStr, function (issue, fileContentData) {
                        if      (issue) {       throw issue     } // Propagate any read errors
                        const   virtualFile      =      new pluginUtils.File({
                                rootDir          :      dirUtils.dirname(fullPathStr),
                                path             :      fullPathStr,
                                contents         :      new Buffer(fileContentData),
                        })
                        callbackFn(virtualFile)
                })
        }       else    { // Synchronous file construction
                return  new pluginUtils.File({
                        rootDir          :      dirUtils.dirname(fullPathStr),
                        path             :      fullPathStr,
                        contents         :      new Buffer(fileSys.readFileSync(fullPathStr)),
                })
        }
}

function  processFileRecursively(processedFile, currentOptions ,completionHandler) {

        outputMsg('[Initiating recursive processing]', processedFile.path)

        insertIncludedSections(processedFile, currentOptions)

        const   parentTemplate   =      locateParentTemplate(processedFile.contents.toString('utf-8'))

        if      (!parentTemplate) { // No parent template was found in the current file.
                outputMsg('[No parent template identified]', processedFile.path)
                completionHandler()
                return
        }

        const   parentRelativePath       =      parentTemplate.path

        outputMsg('[Discovered parent template path]: ' + parentRelativePath)

        if      (!parentRelativePath) { // If parent path is not specified, complete
                completionHandler()
                return
        }

        let     parentFullPath
        if(currentOptions.root && isRootRelative(parentRelativePath)){ // If root is specified and path is relative to it
                parentFullPath   =      dirUtils.join(currentWorkingDirectory.cwd(), currentOptions.root, parentRelativePath)
        }       else    { // Otherwise, relative to the current file's directory
                parentFullPath   =      dirUtils.join(dirUtils.dirname(processedFile.path), parentRelativePath)
        }

        constructFileObject(parentFullPath, function (parentFileObj) {

                processFileRecursively(parentFileObj, _currentConfig, function () {

                        const   parentFileText   =      parentFileObj.contents.toString()
                        const   textLines        =      divideByLineBreaks(parentFileText)

                        const   modifiedLines    =      textLines.map(function (currentLine, lineIndex, allLines) {
                                currentLine      =      substitutePlaceholders(currentLine, parentTemplate.context)
                                const   sectionName      =      discoverPlaceholder(currentLine)
                                if      (sectionName) { // Placeholder found, try to get content from processed file
                                        const   sectionContent   =      retrieveSectionContent(processedFile.contents.toString(), sectionName)
                                        return  sectionContent || currentLine
                                }       else    {
                                        return  currentLine
                                }
                        })

                        const   finalContent     =      modifiedLines.join('\n')

                        processedFile.contents    =      new Buffer(finalContent)

                        return  completionHandler()

                })

        })

}

function  insertIncludedSections(processedFile, currentOptions) {
        const   contentString    =      processedFile.contents.toString()
        const   sourceLines      =      divideByLineBreaks(contentString)
        const   insertedLines    =      sourceLines.map(function (currentLine) {
                const   includedSection  =      locateIncludedSection(currentLine)
                if      (includedSection && includedSection.path) { // An include directive was found
                        let     sectionFullPath
                        if(currentOptions.root && isRootRelative(includedSection.path)){ // Path relative to root option
                                sectionFullPath  =      dirUtils.join(currentWorkingDirectory.cwd(), currentOptions.root, includedSection.path)
                        }       else    { // Path relative to current file's directory
                                sectionFullPath  =      dirUtils.join(dirUtils.dirname(processedFile.path), includedSection.path)
                        }
                        outputMsg('[Including file]', sectionFullPath)
                        const   targetFile       =      constructFileObject(sectionFullPath)
                        if      (includedSection.context) { // If context is provided, interpolate variables
                                targetFile.contents       =      new Buffer(substitutePlaceholders(targetFile.contents.toString(),
                                        includedSection.context))
                        }
                        insertIncludedSections(targetFile, currentOptions) // Recursively process included file
                        if      (_currentConfig.commentMarkers) { // Add annotation comments if enabled
                                return  [
                                        '<!-- start ' + dirUtils.basename(sectionFullPath) + '-->',
                                        targetFile.contents.toString(),
                                        '<!-- end ' + dirUtils.basename(sectionFullPath) + '-->'
                                ].join('\n')
                        }       else    {
                                return  targetFile.contents.toString()
                        }
                }       else    {
                        return  currentLine
                }
        })

        processedFile.contents    =      new Buffer(insertedLines.join('\n'))

}

function  locateParentTemplate(inputString) {
        const   matchingPattern  =      /<!--\s*@@master\s*[= ]\s*(\S+)\s*(?:([^-]+)\s*)?-->/
        const   patternMatch     =      inputString.match(matchingPattern)
        return  patternMatch ? {
                path             :      patternMatch[1],
                context          :      patternMatch[2] ? JSON.parse(patternMatch[2]) : null
        }       :       null
}

function  locateIncludedSection(inputString) {
        const   matchingPattern  =      /<!--\s*@@include\s*[= ]\s*(\S+)\s*(?:([^-]+)\s*)?-->/
        const   patternMatch     =      inputString.match(matchingPattern)
        return  patternMatch ? {
                path             :      patternMatch[1],
                context          :      patternMatch[2] ? JSON.parse(patternMatch[2]) : null
        }       :       null

}

function  discoverPlaceholder(inputString) {
        const   matchingPattern  =      /<!--\s*@@placeholder\s*[= ]\s*(\S+)\s*-->/
        const   patternMatch     =      inputString.match(matchingPattern)
        return  patternMatch ? patternMatch[1] : null
}

function  substitutePlaceholders(inputTemplate, dataContext) {
        if      (!dataContext) {        return inputTemplate    } // No context, no substitution
        if      (inputTemplate.indexOf('@@var') < 0) {    return inputTemplate    } // No variables to substitute
        const   matchingPattern  =      /<!--\s*@@var\s*[= ]\s*([^- ]+)\s*-->/
        let     patternMatch     =      matchingPattern.exec(inputTemplate)
        while   (patternMatch) {
                inputTemplate    =      inputTemplate.replace(patternMatch[0], dataContext[patternMatch[1]] || '')
                patternMatch     =      matchingPattern.exec(inputTemplate)
        }
        return  inputTemplate
}

function  retrieveSectionContent(inputString, sectionName) {
        let     finalResult      =      '' // This variable is not used in the original function.
        const   textLines        =      divideByLineBreaks(inputString)
        let     insideSection    =      false
        const   matchingPattern  =      new RegExp('<!--\\s*@@block\\s*[= ]\\s*' + sectionName + '\\s*-->')

        return  [ _currentConfig.commentMarkers ? '<!-- start ' + sectionName + ' -->' : '',
                textLines.reduce(function (accumulator, element) {
                        if      (insideSection) {
                                const   endPatternMatch  =      /<!--\s*@@close\s*-->/.test(element)
                                if      (endPatternMatch) {
                                        insideSection    =      false
                                        return  accumulator
                                }
                                return  accumulator + (accumulator === '' ? '' : '\n') + element
                        }
                        const   beginPatternMatch        =      matchingPattern.test(element)
                        if      (beginPatternMatch) {
                                insideSection    =      true
                                return  accumulator
                        }       else    {
                                return  accumulator
                        }
                }, ''),
                _currentConfig.commentMarkers ? '\n<!-- end ' + sectionName + ' -->' : ''
        ].join('\n')
}

function  divideByLineBreaks(inputString) {
        return  inputString.split(/\r\n|\n|\r/)
}


function  checkAbsolutePath(inputPath){
        return  dirUtils.resolve(inputPath) === dirUtils.normalize(inputPath)
}
function  isRootRelative(inputPath){
        return  inputPath.indexOf(dirUtils.normalize(dirUtils.sep)) === 0
}