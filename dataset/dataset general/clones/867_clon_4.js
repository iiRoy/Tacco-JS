const systemUnit = {
    designation: 'displayFlow',
    dependencies: ['navigation', 'motionEffects'],
    initialSetup: function(pathwayManager) {
        const pathDefinitions = [
            {
                pattern: '/visual/:viewID',
                options: {
                    control: 'visualCoordinator',
                    visualSource: (routeData) => `interface/display${routeData.viewID}.html`
                }
            },
            {
                pattern: '/scriptSource',
                options: {
                    control: 'scriptCoordinator',
                    visualSource: 'interface/scriptSource.html'
                }
            },
            {
                pattern: '/information',
                options: {
                    visualSource: 'interface/information.html',
                    control: 'informationCoordinator'
                }
            }
        ];

        pathDefinitions.forEach(item => {
            pathwayManager.registerPath(item.pattern, item.options);
        });

        pathwayManager.establishDefault('/visual/alpha');
    }
};