var cluster = require('cluster-master');

module.exports = function cluster_fudged(worker) {
  cluster({
    exec : worker,
    env : process.env,
    args : ['--harmony'],
    signals : false,
    size : require('os').cpus().length
  });

  return cluster;
};
