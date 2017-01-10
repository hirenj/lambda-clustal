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

	var config_options = {
		'git-describe': {
			options: {},
			default: {}
		},
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
					region: config.region,
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

	};

	config_options['lambda_checkversion'] = config_options['lambda_setversion'] = {};
	Object.keys(config_options['lambda_deploy']).forEach(function(targ) {
		config_options['lambda_checkversion'][targ] = true;
		config_options['lambda_setversion'][targ] = true;
	});

	grunt.initConfig(config_options);

	grunt.registerTask('saveRevision', function() {
		grunt.event.once('git-describe', function (rev) {
			grunt.option('gitRevision', rev);
		});
		grunt.task.run('git-describe');
	});

	grunt.registerMultiTask('lambda_checkversion','Check for version of lambda function',function(){
		grunt.task.requires('git-describe');
		var done = this.async();
		var target = this.target;
		if ( ! grunt.config().lambda_deploy[target] ) {
			grunt.log.writeln("No arn");
			grunt.config('lambda_package.'+target,null);
			grunt.config('lambda_deploy.'+target,null);
			grunt.config('lambda_setversion.'+target,null);
			done();
			return;
		}
		var arn = grunt.config().lambda_deploy[target].function;
		var AWS = require('aws-sdk');
		var lambda = new AWS.Lambda();
		lambda.getFunctionConfiguration({FunctionName: arn},function(err,data) {
			var git_status = grunt.option('gitRevision');
			if (git_status.dirty) {
				grunt.log.writeln("Git repo is dirty, updating by default");
			} else {
				var current_version = data.Description;
				if (current_version === git_status.toString()) {
					grunt.config('lambda_package.'+target,null);
					grunt.config('lambda_deploy.'+target,null);
					grunt.config('lambda_setversion.'+target,null);
				}
			}
			done();
		});
	});

	grunt.registerMultiTask('lambda_setversion','Set version for lambda function',function(){
		grunt.task.requires('git-describe');
		var done = this.async();
		var target = this.target;
		if ( ! grunt.config().lambda_deploy[target] ) {
			grunt.log.writeln("No arn");
			done();
			return;
		}
		var arn = grunt.config().lambda_deploy[target].function;
		var AWS = require('aws-sdk');
		var lambda = new AWS.Lambda();
		grunt.log.writeln("Setting version for "+target+" to ",grunt.option('gitRevision').toString());
		lambda.updateFunctionConfiguration({FunctionName: arn,Description: grunt.option('gitRevision').toString() },function(err,data) {
			if ( ! err ) {
				done();
			} else {
				grunt.fail.fatal(err);
			}
		});
	});

	grunt.registerTask('versioncheck',['saveRevision']);

	grunt.registerTask('deploy', [ 'env:prod', 'versioncheck', 'lambda_checkversion', 'lambda_package', 'lambda_deploy','lambda_setversion']);
	grunt.registerTask('test', ['lambda_invoke']);
};
