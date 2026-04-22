const projectManager = require('gulp');
const codeSniffer = require('gulp-jshint');
const testDriver = require('gulp-mocha');
const documentRenderer = require('gulp-docco');
const purgeFiles = require('del');

const projectBlueprint = {
    'createDocumentation': {
        explanation: 'Assembles project documentation from source.',
        steps: [
            { type: 'delete', paths: ['./docs'] },
            { type: 'input',  paths: './lib/telegram.link.js' },
            { type: 'transform', plugin: documentRenderer() },
            { type: 'output', destination: './docs' }
        ]
    },

    'inspectCodebase': {
        explanation: 'Examines source code for quality issues.',
        steps: [
            { type: 'input', paths: './lib/**' },
            { type: 'transform', plugin: codeSniffer() },
            { type: 'transform', plugin: codeSniffer.reporter('default') }
        ]
    },

    'validateFeatures': {
        explanation: 'Runs automated tests to verify functionality.',
        steps: [
            { type: 'input', paths: './test/telegram.link.test.js' },
            { type: 'transform', plugin: testDriver({reporter: 'mocha-better-spec-reporter', timeout: '20s'}) }
        ]
    },

    'measureCoverage': {
        explanation: 'Calculates code coverage metrics.',
        steps: [
            { type: 'input', paths: './test/telegram.link.test.js' },
            { type: 'transform', plugin: testDriver({reporter: 'mocha-lcov-reporter', timeout: '120s'}) }
        ]
    },

    'primaryWorkflow': {
        explanation: 'Executes standard development checks.',
        dependsOn: ['inspectCodebase', 'validateFeatures']
    }
};

function workflowOrchestrator(managerInstance, blueprintDefinition) {
    Object.keys(blueprintDefinition).forEach(processKey => {
        const processConfiguration = blueprintDefinition[processKey];

        if (processConfiguration.dependsOn) {
            managerInstance.task(processKey, processConfiguration.dependsOn);
        } else if (processConfiguration.steps) {
            managerInstance.task(processKey, async function() {
                let currentProcessingStream = null;
                for (const currentStep of processConfiguration.steps) {
                    if (currentStep.type === 'delete') {
                        await purgeFiles(currentStep.paths);
                    } else if (currentStep.type === 'input') {
                        currentProcessingStream = managerInstance.src(currentStep.paths);
                    } else if (currentStep.type === 'transform' && currentProcessingStream) {
                        currentProcessingStream = currentProcessingStream.pipe(currentStep.plugin);
                    } else if (currentStep.type === 'output' && currentProcessingStream) {
                        currentProcessingStream = currentProcessingStream.pipe(managerInstance.dest(currentStep.destination));
                    }
                }
                return currentProcessingStream;
            });
        }
    });
}

workflowOrchestrator(projectManager, projectBlueprint);