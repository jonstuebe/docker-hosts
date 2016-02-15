var fs = require('fs'),
    nginx = require('./nginx'),
    hosts = require('./hosts');

var opts = function(configPath) {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

var run = function(configPath){
    var _opts = opts(configPath);
    nginx.updateConf(_opts);
    hosts.update(_opts);
}

var init = function(configPath){
    run(configPath);
    fs.watchFile(configPath, function(curr, prev){
        if(curr.mtime != prev.mtime && curr.size != prev.size) run(configPath);
    });
}

module.exports = {
    init: init,
    opts: opts
}
