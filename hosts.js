var systemHosts = require('hosts-group'),
    _ = require('lodash');

var groupName = 'docker';

var update = function(_opts){

    var hosts = systemHosts.get();
    if(hosts[groupName]) delete hosts[groupName];
    hosts[groupName] = [];

    _.forEach(_opts.hosts, function(host){
        hosts[groupName].push(systemHosts.createHost(host.hostname, '127.0.0.1', { groupName: groupName, disabled: false }));
    });

    systemHosts.save(hosts);
    console.log('system hosts updated');

}

module.exports = {
    update: update
}
