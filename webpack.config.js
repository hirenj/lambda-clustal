const base_config = require('gator-webpack');
let config = base_config.Load();
const ModuleInstaller = base_config.ModuleInstaller;

config.plugins = [ new ModuleInstaller(['hirenj/node-clustal']) ].concat(config.plugins);

config.externals = config.externals.concat(
  [{ 'node-clustal' : 'node-clustal' }
  ]
)
module.exports = config