let cluster = require('cluster'), cpuNums = require('os').cpus().length;

//生成新进程时的配置
cluster.setupMaster({
    exec: 'demo_2_worker.js',
    args: ['--use', 'http']
});

for (let i = 0; i < cpuNums; ++i) {
    let worker = cluster.fork();

    worker.send('hello , this is from master');
}
