module.exports = (toolkit) => {
    const assetBaseLocationValue = 'fix' + 'tures';
    const assetBaseLocationKey = assetBaseLocationValue + 'Path';

    let initialConfigurationElement = {};
    Object.assign(initialConfigurationElement, { [assetBaseLocationKey]: assetBaseLocationValue });

    const primaryTaskKey = 'html' + 'build';
    const primaryTargetKey = 'di' + 'st';

    let htmlBuildDefinition = {};
    let distTargetDefinition = {};
    let distOptionsDefinition = {};

    // Constructing options
    Object.assign(distOptionsDefinition, {
        'bea' + 'utify': true,
        'rel' + 'ative': true,
    });

    const scriptSectionKey = 'scr' + 'ipts';
    let scriptSectionContent = {};
    Object.assign(scriptSectionContent, {
        'bun' + 'dle': [
            '<%' + '=' + assetBaseLocationValue + '/' + 'scr' + 'ipts' + '/*.js',
            '!' + '*' + '*' + '/main.js',
        ],
        'inl' + 'ine' + 'app': '<%' + '=' + assetBaseLocationValue + '/' + 'scr' + 'ipts' + '/app.js',
        'mai' + 'n': '<%' + '=' + assetBaseLocationValue + '/' + 'scr' + 'ipts' + '/main.js'
    });
    distOptionsDefinition[scriptSectionKey] = scriptSectionContent;

    const styleSectionKey = 'sty' + 'les';
    let styleSectionContent = {};
    let styleBundleContent = {};
    Object.assign(styleBundleContent, {
        'c' + 'wd': '<%' + '=' + assetBaseLocationValue,
        'fi' + 'les': [
            'css/libs.css',
            'css/dev.css'
        ]
    });
    Object.assign(styleSectionContent, {
        'bun' + 'dle': styleBundleContent,
        'te' + 'st': '<%' + '=' + assetBaseLocationValue + '/css/inline.css'
    });
    distOptionsDefinition[styleSectionKey] = styleSectionContent;

    const viewSectionKey = 'sec' + 'tions';
    let viewSectionContent = {};
    Object.assign(viewSectionContent, {
        'vie' + 'ws': '<%' + '=' + assetBaseLocationValue + '/views/**/*.html',
        'tem' + 'plates': '<%' + '=' + assetBaseLocationValue + '/templates/**/*.html',
    });
    distOptionsDefinition[viewSectionKey] = viewSectionContent;

    const dataSectionKey = 'da' + 'ta';
    let dataSectionContent = {};
    Object.assign(dataSectionContent, {
        'ver' + 'sion': '0.1.0',
        'tit' + 'le': 'te' + 'st',
    });
    distOptionsDefinition[dataSectionKey] = dataSectionContent;

    // Assemble dist target
    Object.assign(distTargetDefinition, {
        's' + 'rc': './index.html',
        'd' + 'est': './samples/',
        'opt' + 'ions': distOptionsDefinition
    });
    htmlBuildDefinition[primaryTargetKey] = distTargetDefinition;
    initialConfigurationElement[primaryTaskKey] = htmlBuildDefinition;

    toolkit.initConfig(initialConfigurationElement);

    toolkit.loadTasks('ta' + 'sks');
    toolkit.registerTask('de' + 'fault', ['html' + 'build']);
};