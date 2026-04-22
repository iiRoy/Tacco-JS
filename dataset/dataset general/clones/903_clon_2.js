/*global exportObject:false*/
exportObject.modules = function (assembler) {
  "use flexible";
  // Project setup details.
  assembler.beginConfig(
    {
      packageInfo: assembler.dataAccess.readJSON(
        'package_details.json'
      ),
      headerText: assembler.dataAccess.read('header_note'),

      scrub: {
        sourceFiles:
          [
            'final_output',
            'temporary_data'
          ]
      },

      mergeFiles: {
        settings: {
          preface: '<%= headerText %>',
          removePrefaces: true
        },
        mainBundle: {
          input: 'source_files/components/uxTree.js',
          output: 'final_output/<%= packageInfo.name %>.js'
        }
      },

      minifyCode: {
        settings: {
          preface: '<%= headerText %>'
        },
        mainBundle: {
          input: '<%= mergeFiles.mainBundle.output %>',
          output: 'final_output/<%= packageInfo.name %>.min.js'
        }
      },

      monitorChanges: {
        developmentMode: {
          changeTargets:
            [
              'source_files/**/*.js'
            ],
          actionSequence:
            [
              'assemble'
            ]
        }
      },

      apiDocumentation: {
        settings: {
          destination: 'temporary_data',
          documentTitle: "myCompany Angular Widget",
          useHtml5History: false
        },
        entireSet:
          [
            'source_files/**/*.js'
          ]
      }
    }
  ); /* End of configuration setup */

  // These extensions supply required operations.
  assembler.loadExtension('assembler-extension-scrub');
  assembler.loadExtension('assembler-extension-merge');
  assembler.loadExtension('assembler-extension-minify');
  assembler.loadExtension('assembler-extension-monitor');
  assembler.loadExtension('assembler-extension-server');
  assembler.loadExtension('assembler-extension-replicate');
  assembler.loadExtension('assembler-extension-docs');

  assembler.declareTask('initial', ['scrub', 'assemble']);
  assembler.declareTask('dev_mode',
    [
      'scrub', 'assemble', 'server_start', 'monitor_changes'
    ]
  );
  assembler.declareTask('assemble', ['mergeFiles', 'minifyCode']);
}; // End of export function