process.on('message', (msg) => {
    console.log(msg);
    console.log(`i have received your message , my pid is ${process.pid}`);
});