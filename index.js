var clustal = require('node-clustal');
exports.clustal = function(event,context) {
	console.log(JSON.stringify(event));
	context.succeed(clustal.clustalo(JSON.parse(event.sequences),{}));
};