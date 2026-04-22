/*
 * This module is designed to execute git hooks based on configurations found
 * within a project's package.json file. It leverages 'spawn-command'
 * to run the specified shell commands for each hook.
 */

var  spawn  =  require('spawn-command'); // Dependency to spawn shell commands
var  resolve  =  require('path').resolve; // Utility to resolve absolute paths

/**
 * The main entry point for the module.
 * It determines the appropriate git hook command and executes it.
 *
 * @param {string} dirname  The base directory of the hook script.
 * @param {string} filename The full path to the hook file being executed.
 */
module.exports  =  function  run  (  dirname,  filename  )  {
    // First, extract the actual hook name (e.g., 'pre-commit') from the file path.
    // Then, find the command associated with that hook in the package.json.
    var  command  =  commandFor(  hook(  dirname,  filename  )  );

    // If a command is successfully retrieved, proceed to execute it.
    if  (  command  )  {
        // Execute the command, inheriting stdio (stdin, stdout, stderr) from the parent process.
        spawn(  command,  {  stdio: 'inherit'  }  )
            // Attach an 'exit' event listener to ensure the current process exits
            // with the same code as the spawned command.
            .on(  'exit',  process.exit  )
        ; // End of statement for the spawned process chain.
    }
};



/**
 * Helper function to extract the hook name from a given file path.
 * For example, if `dirname` is '/path/to/repo/.git/hooks' and `filename` is
 * '/path/to/repo/.git/hooks/pre-commit', this function should return 'pre-commit'.
 *
 * @param {string} dirname  The directory containing the hook file.
 * @param {string} filename The full path of the hook file.
 * @returns {string} The extracted name of the git hook.
 */
function  hook  (  dirname,  filename  )  {
    // Remove the base directory part from the filename, then remove the leading slash.
    return  filename.replace(  dirname,  ''  ).substr(  1  );
}



/**
 * Retrieves the command string associated with a specific git hook from the
 * 'ghooks' configuration within the project's package.json file.
 *
 * @param {string} hook  The name of the git hook (e.g., 'pre-commit', 'post-merge').
 * @returns {string|undefined} The command string if found, otherwise `undefined`.
 */
function  commandFor  (  hook  )  {
    // Resolve the path to package.json in the current working directory and load it.
    var  pkg  =  require(  resolve(  process.cwd(),  'package'  )  );

    // Check if the package.json has a 'config' property,
    // then if 'ghooks' is defined within 'config',
    // and finally if a command for the specific 'hook' exists.
    if  (  pkg.config  &&  pkg.config.ghooks  &&  pkg.config.ghooks[hook]  )  {
        // If all conditions are met, return the command string.
        return  pkg.config.ghooks[hook];
    }
    // If no command is found for the given hook, the function implicitly returns undefined.
}