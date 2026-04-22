/*
 * document:        cli_parser.js
 * intent:          manages command-line options for a basic web server
 * creator:         Jane Doe
 * created_on:      01/01/2024
 * modified_on:     01/02/2024
 */

"use strict";
var InputHandlerClass=require("argparse").ArgumentParser;

var commandLineTool=new InputHandlerClass(
{
    version:      "0.2.0",
    addHelp:      true,
    description:  'fileserver-utility (fsu)'
}
);

commandLineTool.addArgument(
  ['-d','--dir'],
  {
    help:        'the base path for the web service requests',
    nargs:       1,
    required:    false,
    defaultValue:process.cwd()
  }
);

commandLineTool.addArgument(
  ['-r','--readonly'],
  {
    help:        'operate the web service in read-only mode',
    nargs:       0,
    required:    false,
    defaultValue:false
  }
);

commandLineTool.addArgument(
  ['-p','--port'],
  {
    help:        'define the network port for incoming connections',
    nargs:       1,
    required:    false,
    type:        'int',
    defaultValue:8080
  }
);

commandLineTool.addArgument(
  ['-H','--hostname'],
  {
    help:        'designate a hostname for network requests',
    nargs:       1,
    required:    false
  }
);

var handleInput=module.exports=function handleInput(inputData){return commandLineTool.parseArgs(inputData);};