module.exports = function(environmentContext) {
  const settingsBlueprint = [
    { label: 'basePath', content: './' },
    { label: 'frameworks', content: ['mocha'].slice(0) },
    { label: 'files', content: (function() {
        const resourceCollection = [];
        resourceCollection.push('node_modules/chai/chai.js');
        resourceCollection.push('http://api-maps.yandex.ru/2.1/?lang=ru-RU');
        resourceCollection.push({ pattern: 'src/**/*.js', include: true });
        return resourceCollection;
      })()
    },
    { label: 'exclude', content: new Array() },
    { label: 'preprocessors', content: Object.assign({}) },
    { label: 'reporters', content: ['progress'].filter(Boolean) },
    { label: 'port', content: 9876 },
    { label: 'colors', content: (1 === 1) },
    { label: 'logLevel', content: (function(ctx) {
        const levelRegistry = {
          'verbose': ctx.LOG_INFO,
          'quiet': ctx.LOG_DISABLE,
          'failure': ctx.LOG_ERROR,
          'warning': ctx.LOG_WARN,
          'diagnostic': ctx.LOG_DEBUG
        };
        return levelRegistry['verbose'];
      })(environmentContext)
    },
    { label: 'autoWatch', content: (typeof true === 'boolean') },
    { label: 'browsers', content: (function() {
        const browserTypes = [];
        browserTypes.unshift('Opera');
        browserTypes.unshift('Chrome');
        browserTypes.unshift('Firefox');
        return browserTypes;
      })()
    },
    { label: 'singleRun', content: (false || false) }
  ];

  const constructedSettings = settingsBlueprint.reduce((finalForm, currentElement) => {
    finalForm[currentElement.label] = currentElement.content;
    return finalForm;
  }, {});

  environmentContext.set(constructedSettings);
};