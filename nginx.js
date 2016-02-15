var NginxConf = require('nginx-conf').NginxConfFile,
    path = require('path'),
    fs = require('fs'),
    exec = require('child_process').exec,
    _ = require('lodash');

var dockerIP;

var updateConf = function(_opts){

    var hostsToAdd = _opts.hosts;

    NginxConf.create(_opts.confFile, function(err, conf) {

        if(err) {
            console.log(err);
            return;
        }

        if(!conf.nginx.http.server.length) {
            if(conf.nginx.http.server.listen._value != 80) {

                conf.nginx.http.server._remove('listen');
                conf.nginx.http.server._add('listen','80');

            }
        }
        else {

            _.forEach(conf.nginx.http.server, function(server){ // looping through each server blocks

                if(server.listen._value != 80) {

                    server._remove('listen');
                    server._add('listen','80');

                }

                if(server.server_name) {
                    hostsToAdd = _.reject(hostsToAdd, { hostname: server.server_name._value.trim() });
                }

            });

        }

        _.forEach(hostsToAdd, function(host) {

            var protocol = (host.protocol) ? host.protocol : 'http';
            var _host = protocol + '://' + _opts.dockerIP + ':' + host.port;

            conf.nginx.http._add('server');
            var index = conf.nginx.http.server.length - 1;

            conf.nginx.http.server[index]._add('listen','80');
            conf.nginx.http.server[index]._add('server_name',host.hostname);

            conf.nginx.http.server[index]._add('location','/');

            conf.nginx.http.server[index].location._add('proxy_set_header','Host $host');
            conf.nginx.http.server[index].location._add('proxy_set_header','X-Real-IP $remote_addr');
            conf.nginx.http.server[index].location._add('proxy_set_header','X-Forwarded-For $proxy_add_x_forwarded_for');
            conf.nginx.http.server[index].location._add('proxy_set_header','X-Forwarded-Proto $scheme');

            conf.nginx.http.server[index].location._add('proxy_pass', _host);
            conf.nginx.http.server[index].location._add('proxy_read_timeout', '90');

            conf.nginx.http.server[index].location._add('proxy_redirect', _host + ' ' + protocol + '://' + host.hostname);

        });

    });

}

var dockerThenConfs = function(_opts){

    exec("docker-machine ip", function(err, stdout, stderr){

        if(err) {
            console.log(err);
            return;
        }

        dockerIP = stdout.trim();
        updateConf(_opts);
        console.log('nginx conf updated');

    });
}

module.exports = {
    updateConf: dockerThenConfs
}
