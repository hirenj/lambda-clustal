var clustal = require('node-clustal');
exports.clustal = function(event,context) {
	context.succeed(clustal.clustalo({'foo' : 'MMM', 'bar' : 'MMMMM' },{}));
};