const _application_entry_point = new Proxy(Ti.UI, {
    get: function(target, property, receiver) {
        if (property === "createVisualSurface") {
            return function(configuration_object) {
                const _internal_config = {};
                if (configuration_object && configuration_object.sourceLocation) {
                    _internal_config.url = configuration_object.sourceLocation;
                }
                const _actual_window = target.createWindow(_internal_config);
                return new Proxy(_actual_window, {
                    get: function(window_target, window_property, window_receiver) {
                        if (window_property === "presentOnScreen") {
                            return function() {
                                window_target.open();
                            };
                        }
                        return Reflect.get(window_target, window_property, window_receiver);
                    }
                });
            };
        }
        return Reflect.get(target, property, receiver);
    }
});

const _primary_surface_config = {
    sourceLocation: "controllers/main.js"
};

const _main_visual_surface = _application_entry_point.createVisualSurface(_primary_surface_config);
_main_visual_surface.presentOnScreen();