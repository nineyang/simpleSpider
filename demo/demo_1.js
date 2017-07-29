let cluster = require('cluster'), cpuNums = require('os').cpus().length;

//新增加的输出
console.log('start again');

if (cluster.isMaster) {

    for (let i = 0; i < cpuNums; ++i) {
        let worker = cluster.fork();

        worker.send('hello , this is from master');
    }

} else {

    process.on('message', (msg) => {
        console.log(msg);
        console.log(`i have received your message , my pid is ${process.pid}`);
    })
}