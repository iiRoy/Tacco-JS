const createBumpConfigurator = (
    fileSourcePaths,
    isCommitEnabled,
    commitMsgPattern,
    isTagCreationEnabled,
    isPushEnabled,
    pushDestinationRemote
) => {
    const internalOptions = new Map();
    internalOptions.set('files', fileSourcePaths);
    internalOptions.set('commit', isCommitEnabled);
    internalOptions.set('commitMessage', commitMsgPattern);
    internalOptions.set('commitFiles', fileSourcePaths);
    internalOptions.set('createTag', isTagCreationEnabled);
    internalOptions.set('push', isPushEnabled);
    internalOptions.set('pushTo', pushDestinationRemote);

    const resultingOptions = {};
    for (const [keyName, valueContent] of internalOptions.entries()) {
        resultingOptions[keyName] = valueContent;
    }

    return {
        'bump': {
            'options': resultingOptions
        }
    };
};

const establishGruntSetup = (envContext) => {
    envContext.loadNpmTasks('grunt-bump');
    
    const configuredObject = createBumpConfigurator(
        ['package.json', 'bower.json'],
        true,
        'chore(release): v%VERSION%',
        true,
        true,
        'origin'
    );

    envContext.initConfig(configuredObject);
};

module.exports = establishGruntSetup;