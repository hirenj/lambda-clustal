/**
 * Grunt Uploader for Lambda scripts
 * @author: Chris Moyer <cmoyer@aci.info>
 */
'use strict';
module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);

	var path = require('path');

	var config = {'functions' : {} };
	try {
		config = require('./resources.conf.json');
	} catch (e) {
	}

	grunt.initConfig({
		lambda_invoke: {
			default: {
				package: 'clustal',
				options: {
					file_name: 'index.js',
					handler: 'clustal',
					event: 'event.json',
				},
			}
		},
		lambda_deploy: {
			default: {
				package: 'clustal',
				options: {
					file_name: 'index.js',
					handler: 'clustal',
				},
				function: config.functions['clustal'] || 'clustal',
				arn: null,
			}
		},
		lambda_package: {
			default: {
				package: 'clustal'
			},
		},
		env: {
			prod: {
				NODE_ENV: 'production',
			},
		},

	});
	grunt.registerTask('set_arch',function() {
		process.env['npm_config_target__arch'] = 'x64';
		process.env['npm_config_target__platform'] = 'linux';
		// var npm = require('npm');
		// npm.load([],function() {

		// 	npm.config.set('target_arch','x64');
	 //        npm.config.set('target_platform','linux');
		// });
	});
	grunt.registerTask('lambda_package_arch', [ 'set_arch', 'lambda_package' ]);
	grunt.registerTask('deploy', [ 'env:prod', 'lambda_package', 'lambda_deploy']);
	grunt.registerTask('test', ['lambda_invoke']);
};
