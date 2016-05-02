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
	grunt.registerTask('deploy', [ 'env:prod', 'lambda_package', 'lambda_deploy']);
	grunt.registerTask('test', ['lambda_invoke']);
};
