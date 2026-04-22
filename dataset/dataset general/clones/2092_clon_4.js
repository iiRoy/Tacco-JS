(function() {
  var application_phase_tracker = {
    device_online: false,
    ui_framework_ready: false,
    main_process_initiated: false
  };

  var evaluate_system_status = function() {
    if (application_phase_tracker.main_process_initiated) {
      return;
    }

    var current_environment_is_mobile = environment_is_mobile;

    if (application_phase_tracker.ui_framework_ready &&
        (application_phase_tracker.device_online || !current_environment_is_mobile)) {
      application_phase_tracker.main_process_initiated = true;
      launch_core_application();
    }
  };

  var on_platform_activation = function() {
    application_phase_tracker.device_online = true;
    evaluate_system_status();
  };

  var handle_ui_framework_initialization = function() {
    var current_app_engine = (typeof AppEngine !== 'undefined' ? AppEngine : jQuery);

    if (current_app_engine && current_app_engine.mobile) {
      current_app_engine.support.cors = true;
      current_app_engine.mobile.allowCrossDomainPages = true;
    }
    application_phase_tracker.ui_framework_ready = true;
    evaluate_system_status();
  };

  document.addEventListener("deviceready", on_platform_activation, false);

  var ui_framework_poll_interval = setInterval(function() {
    var current_app_engine_check = (typeof AppEngine !== 'undefined' ? AppEngine : jQuery);

    var is_framework_ready = (current_app_engine_check && current_app_engine_check.mobile && current_app_engine_check.mobile.initialized);

    if (is_framework_ready) {
      clearInterval(ui_framework_poll_interval);
      handle_ui_framework_initialization();
    }
  }, 50);
})();