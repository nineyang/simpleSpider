let cluster = require('cluster'), cpuNums = require('os').cpus().length, num = 20, workList = [];
cluster.setupMaster({
    exec: 'worker.js',
    args: ['--use', 'http']
});

for (let i = 0; i < cpuNums; ++i) {
    let work = cluster.fork();
    work.send([i , cpuNums]);
    workList.push(work);
    work.on('message' , (msg)=>{
        console.log(msg);
    });
    work.on('exit' , (code ,signal)=>{

    })
}


cluster.on('exit', (worker, code, signal) => {
    console.log(`${worker.process.pid} is died`);
    // let work = cluster.fork();
    // work.send('hi this is from master:' + process.pid);
});






