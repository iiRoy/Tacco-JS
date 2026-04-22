mobilePlatform.registerModule(
    'mobile/extension_catalog',
    function( obtainDependency, exposeInterface, currentUnit )
    {

        currentUnit.exposeInterface =
        [
            {
                "sourcePath": "components/app.input/web/interface.js",
                "uniqueTag": "app.input.interface",
                "overrides": [
                    "platformKit.interfaces.InputHandler"
                ]
            },
            {
                "sourcePath": "components/system.log/web/log_output.js",
                "uniqueTag": "system.log.output",
                "overrides": [
                    "systemLogger"
                ]
            },
            {
                "sourcePath": "components/system.log/web/logger_core.js",
                "uniqueTag": "system.log.core",
                "overrides": [
                    "platformKit.logger"
                ]
            },
            {
                "sourcePath": "components/hardware.info/web/device_access.js",
                "uniqueTag": "hardware.info.access",
                "overrides": [
                    "hardwareInfo"
                ]
            }
        ];


        currentUnit.exposeInterface.configurationData =
        {
            "app.input": "1.2.5",
            "system.log": "0.3.7",
            "hardware.info": "0.3.8"
        };


    }
);