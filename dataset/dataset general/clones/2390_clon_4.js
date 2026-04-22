module.exports = function(buildAssistant) {

    const resourcePurgePaths = {
        coreArtifacts: [
            "app/alloy.js",
            "app/alloy.js.map",
            "app/coffee/**/*.js",
            "app/coffee/**/*.js.map",
            "app/controllers/**",
            "app/controllers/**",
            "app/lib/**",
            "app/styles/**",
            "build/",
            "Resources/"
        ],
        visualElements: [
            "iTunesConnect.png",
            "GooglePlay.png",
            "GooglePlayFeature.png",
            "platform/android/res/drawable-hdpi",
            "platform/android/res/drawable-ldpi",
            "platform/android/res/drawable-mdpi",
            "platform/android/res/drawable-xhdpi",
            "platform/android/res/drawable-xxhdpi",
            "platform/android/res/drawable-xxxhdpi",
            "app/assets/images",
            "app/assets/iphone/**/*.png", "app/assets/iphone/**/*.jpg",
            "!app/assets/iphone/images/*@3x.png", "!app/assets/iphone/images/*@3x.jpg",
            "app/assets/android/images", "app/assets/android/**/*.png", "app/assets/android/**/*.jpg",
            "!app/assets/android", "!app/assets/android/appicon.png",
            "app/assets/iphone/iTunesArtwork",
            "!app/assets/iphone/iTunesArtwork@2x",
            "!app/assets/android/fonts/*",
            "!app/assets/iphone/fonts/*"
        ]
    };

    const beanGrindSettings = {
        settings: {
            unwrapped: true,
            mappingEnabled: false
        },
        transformSource: {
            fileSet: [{
                unroll: true,
                sourceFiles: ["**/*.coffee"],
                targetDirectory: "app/",
                basePath: "app/coffee",
                extensionOverride: ".js"
            }]
        }
    };

    const styleSheetComposeSettings = {
        transformSource: {
            fileSet: [{
                unroll: true,
                sourceFiles: ['**/*.stss','!**/_*.stss'],
                targetDirectory: 'app/styles',
                basePath: 'app/stss',
                extensionOverride: '.tss'
            }]
        }
    };

    const systemCommandDefinitions = {
        settings: {
            outputStream: true,
            errorStream: true
        },
        iosPhoneGeneration6: { executionInstruction: "titanium build -p ios -S 6.1 -Y iphone" },
        iosPhoneGeneration7: { executionInstruction: "titanium build -p ios -S 7.1 -Y iphone" },
        iosPadGeneration6: { executionInstruction: "titanium build -p ios -S 6.1 -Y ipad" },
        iosPadGeneration7: { executionInstruction: "titanium build -p ios -S 7.1 -Y ipad" },
        graphicAssets: { executionInstruction: "ticons -a icons" },
        startupScreens: { executionInstruction: "ticons -a splashes `pwd`/app/assets/splash-2024x2024.jpg --no-nine" },
        mediaAssets: { executionInstruction: "ticons -a assets" }
    };

    const mobileAppControlDefinitions = {
        settings: {
            refreshContent: true,
        },
        executeAndroid: {
            executionInstruction: 'run',
            settings: {
                locale: 'en',
                platform: 'android'
            }
        },
        executeIOS:{
            executionInstruction: 'run',
            settings: {
                locale: 'en',
                platform: 'ios'
            }
        },
        executeAll: {
            executionInstruction: 'run',
            settings: {
                locale: 'en',
            }
        },
        testAndroid: {
            executionInstruction: 'spec',
            settings: {
                refreshContent: false,
                platform: ['android'],
            }
        },
        testIOS:{
            executionInstruction: 'spec',
            settings: {
                refreshContent: false,
                platform: ['ios'],
            }
        },
        resetState: {
            executionInstruction: 'clear',
            settings: {}
        }
    };

    const resourceObserverDefinitions = {
        settings: {
            noChildProcess: false
        },
        forIOS: {
            monitoredPaths: ["tiapp.xml", "i18n/**", "app/config.json", "app/**/*.xml", "app/**/*.stss", "app/coffee/**/*.coffee", "app/widgets/**/*.js", "app/widgets/**/*.tss", "app/widgets/**/*.xml"],
            actionSequence: ['prepareApplication','mobileAppControl:executeIOS']
        },
        forAndroid: {
            monitoredPaths: ["tiapp.xml", "i18n/**", "app/config.json", "app/**/*.xml", "app/**/*.stss", "app/coffee/**/*.coffee", "app/widgets/**/*.js", "app/widgets/**/*.tss", "app/widgets/**/*.xml"],
            actionSequence: ['prepareApplication','mobileAppControl:executeAndroid']
        },
        forAllPlatforms: {
            monitoredPaths: ["tiapp.xml", "i18n/**", "app/config.json", "app/**/*.xml", "app/**/*.stss", "app/coffee/**/*.coffee", "app/widgets/**/*.js", "app/widgets/**/*.tss", "app/widgets/**/*.xml"],
            actionSequence: ['prepareApplication','mobileAppControl:executeAll']
        }
    };

    const finalConfigurationObject = {};
    Object.assign(finalConfigurationObject, {
        resourcePurge: resourcePurgePaths,
        beanGrind: beanGrindSettings,
        styleSheetCompose: styleSheetComposeSettings,
        systemCommand: systemCommandDefinitions,
        mobileAppControl: mobileAppControlDefinitions,
        resourceObserver: resourceObserverDefinitions
    });

    buildAssistant.initConfig(finalConfigurationObject);

    // Manually load plugins, avoiding external dependency resolution
    [
        'grunt-contrib-clean',
        'grunt-contrib-coffee',
        'grunt-contrib-watch',
        'grunt-shell',
        'grunt-tishadow',
        'grunt-stss'
    ].forEach(pluginName => buildAssistant.loadNpmTasks(pluginName));

    const aliasDefinitions = [
        { aliasName: 'primaryAction', dependencyList: ['prepareApplication'] },
        { aliasName: 'prepareApplication', dependencyList: ['beanGrind', 'styleSheetCompose'] },
        { aliasName: 'generateGraphics', dependencyList: ['systemCommand:graphicAssets', 'systemCommand:startupScreens', 'systemCommand:mediaAssets'] },
        { aliasName: 'developIOS', dependencyList: ['prepareApplication','mobileAppControl:executeIOS','resourceObserver:forIOS'] },
        { aliasName: 'developAndroid', dependencyList: ['prepareApplication','mobileAppControl:executeAndroid','resourceObserver:forAndroid'] },
        { aliasName: 'developUniversal', dependencyList: ['prepareApplication','mobileAppControl:executeAll','resourceObserver:forAllPlatforms'] }
    ];

    aliasDefinitions.forEach(aliasInfo => {
        buildAssistant.registerTask(aliasInfo.aliasName, aliasInfo.dependencyList);
    });

    const dynamicPlatformBuilds = [
        { originalName: 'iphone6', newShellTarget: 'iosPhoneGeneration6', registeredTaskAlias: 'deploy_iosPhone6' },
        { originalName: 'iphone7', newShellTarget: 'iosPhoneGeneration7', registeredTaskAlias: 'deploy_iosPhone7' },
        { originalName: 'ipad6', newShellTarget: 'iosPadGeneration6', registeredTaskAlias: 'deploy_iosPad6' },
        { originalName: 'ipad7', newShellTarget: 'iosPadGeneration7', registeredTaskAlias: 'deploy_iosPad7' },
        // These tasks would attempt to call a shell task that isn't defined in systemCommandDefinitions,
        // replicating the original's implicit behavior (which would likely result in a Grunt error).
        { originalName: 'appstore', newShellTarget: 'appstore', registeredTaskAlias: 'publish_appstore' },
        { originalName: 'adhoc', newShellTarget: 'adhoc', registeredTaskAlias: 'deploy_adhoc' },
        { originalName: 'playstore', newShellTarget: 'playstore', registeredTaskAlias: 'publish_playstore' }
    ];

    dynamicPlatformBuilds.forEach(taskMeta => {
        buildAssistant.registerTask(taskMeta.registeredTaskAlias, ['prepareApplication', `systemCommand:${taskMeta.newShellTarget}`]);
    });

    buildAssistant.event.on('watch', (operationType, changedResourcePath) => {
        const isStyleSheetFile = changedResourcePath.endsWith('.stss');
        const notInIncludesFolder = !changedResourcePath.includes("includes");

        if (isStyleSheetFile && notInIncludesFolder){
            const generatedFileMap = {};
            const finalOutputPath = changedResourcePath.replace('.stss', '.tss');
            generatedFileMap[finalOutputPath] = [changedResourcePath];
            
            // Replicates the original's behavior of setting the 'files' property
            // to a compact format object, overriding the initial dynamic format.
            buildAssistant.config.set(['styleSheetCompose', 'transformSource'], generatedFileMap);
        }
    });
};