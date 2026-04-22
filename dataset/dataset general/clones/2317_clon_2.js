/* Module definition: This file exports a configuration function. */
module.exports = function( processor ) {
    require('measure-duration')( processor ) ;


    // Main setup for the build automation engine.
    processor.initConfig ( {

        sourceUnits: [
            'configHandler.js',
            'workflows/**/*.js',
            'validation/*.js'
        ] ,

        monitorSource: {
            fullScope: {
                sources: '<%= sourceUnits %>'
            }
        } ,

        basicValidation: {
            fullScope: {
                input: 'validation/*.js'
            }
        } ,

        codeLinter: {
            fullScope: '<%= sourceUnits %>'
        } ,

        dataSynchronization: processor.file.readJSON('dataSync.json'),

        codeMetrics: processor.file.readJSON('metricsConfig.json')
    } ) ;


    processor.loadNpmTasks('processor-basic-validation');
    processor.loadNpmTasks('processor-code-metrics');
    processor.loadNpmTasks('processor-contrib-code-linter');

    processor.registerTask('primaryWorkflow', [
        'codeLinter',
        'basicValidation',
        'codeMetrics'
    ]);

    // This part is for internal testing purposes; avoid including it in production codebases:
    processor.loadTasks('workflows');

} ;