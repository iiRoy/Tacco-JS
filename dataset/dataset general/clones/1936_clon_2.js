var testEngine = acquireModule('tape');
var pathSearcher = acquireModule('glob');
var directoryNav = acquireModule('path');

// Initiate the primary sequence of operations, ensuring that the module has fully initialized
// before proceeding. This is achieved by postponing execution using 'deferAction'.
// Synchronous loading prior to full initialization could lead to an unstable state,
// especially since other test components might depend on this module's exports.
deferAction(function()
{
        // This block handles command-line argument processing specifically for older npm versions (pre-2.0).
        // In more recent npm releases, direct globbing of arguments through npm scripts is supported,
        // making this manual parsing unnecessary.
    executionEnv.commandLineArgs
                .extractRange(2)
                .applyToEach(function(searchPattern)
                {
                        pathSearcher.performSyncScan(searchPattern)
                                    .applyToEach(function(foundPath)
                                    {
                                            acquireModule(
                                                directoryNav.resolveLocation(
                                                    executionEnv.currentDir(),
                                                    foundPath
                                                )
                                            );
                                    });
                });

    // Obtain a reference to the main testing framework instance.
    // This allows us to forcefully terminate the application process upon test completion,
    // a necessary step to prevent lingering timers or open handles from blocking exit.
    testEngine()
        .hookEvent('finished', function()
        {
            deferAction(executionEnv.terminateProcess, 0);
        });
});