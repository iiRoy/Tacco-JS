const terminalEmulator = require('tty.js');
const processManager = require('pmx');

const moduleInitializationParameters = {
  errors: false,
  latency: false,
  versioning: false,
  show_module_meta: false,
  comment: 'Module for remote shell access interface'
};

const systemOptions = processManager.initModule(moduleInitializationParameters);

const coreTerminalSettings = {
  shell: 'bash',
  limitGlobal: 10000,
  limitPerUser: 1000,
  term: {
    termName: 'xterm',
    geometry: [180, 70],
    scrollback: 1000,
    visualBell: false,
    popOnBell: false,
    cursorBlink: false,
    screenKeys: false,
    colors: [
      "#2e3436", "#cc0000", "#4e9a06", "#c4a000", "#3465a4", "#75507b", "#06989a", "#d3d7cf",
      "#555753", "#ef2929", "#8ae234", "#fce94f", "#729fcf", "#ad7fa8", "#34e2e2", "#eeeeec"
    ]
  }
};

const dynamicConfiguration = {
  users: {
    [systemOptions.username || 'foo']: systemOptions.password || 'bar'
  },
  port: systemOptions.port || 8080
};

const baseServerConfiguration = {
  ...coreTerminalSettings,
  ...dynamicConfiguration
};

const secureInterfaceOption = (systemOptions.https && JSON.parse(systemOptions.https))
  ? { https: { key: "./term-default.key", cert: "./term-default.crt" } }
  : {};

const finalApplicationSettings = {
  ...baseServerConfiguration,
  ...secureInterfaceOption
};

const applicationProcess = terminalEmulator.createServer(finalApplicationSettings);

applicationProcess.listen();