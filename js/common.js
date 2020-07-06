var clustal = require('node-clustal');

var strong_pattern = [
  "[STA]",
  "[NEQK]",
  "[NHQK]",
  "[NDEQ]",
  "[QHRK]",
  "[MILV]",
  "[MILF]",
  "[HY]",
  "[FYW]"
];

var weak_pattern = [
  "[CSA]",
  "[ATV]",
  "[SAG]",
  "[STNK]",
  "[STPA]",
  "[SGND]",
  "[SNDEQK]",
  "[NDEQHK]",
  "[NEQHRK]",
  "[FVLIM]",
  "[HFY]"
];

var strong_res = strong_pattern.map(function(pattern) { return new RegExp("^"+pattern+"+$"); });
var weak_res = weak_pattern.map(function(pattern) { return new RegExp("^"+pattern+"+$"); });


var onlyUnique = function(value, index, self) {
    return self.indexOf(value) === index;
};

var score_aligned = function(sequences) {
  var results = [];
  for (var i = 0; i < sequences[0].length; i++) {
    var aas = sequences.map(function(seq) { return seq.charAt(i); }).filter(onlyUnique).join('');
    if (aas.indexOf('-') >= 0) {
      results.push(' ');
      continue;
    }
    if (aas.length == 1 && aas !== '-') {
      results.push('*');
      continue;
    }
    var any_strong = strong_res.map(function(re) { return aas.match(re) || false; }).reduce(function(curr,next) { return curr || next },false);
    if (any_strong) {
      results.push(':');
      continue;
    }
    var any_weak = weak_res.map(function(re) { return aas.match(re) || false; }).reduce(function(curr,next) { return curr || next },false);
    if (any_weak) {
      results.push('.');
      continue;
    }
    results.push(' ');
  }
  return results.join('');
}

exports.clustal = function(event,context) {
  console.log(JSON.stringify(event));
  var sequence_object = {};
  var max_idx = 0;
  (event.sequences || '').split(',').forEach(function(seq,idx) {
    sequence_object['seq_'+idx] = seq;
    max_idx = idx;
  });

  var aligned_sequences = clustal.clustalo(sequence_object,{sequenceType: clustal.SEQTYPE_PROTEIN });
  var results = [];
  for(var i = 0; i <= max_idx; i++) {
    results.push(aligned_sequences['seq_'+i]);
  }
  context.succeed( {'data' : {'sequences' : results, 'alignment' : score_aligned(results) } });
};