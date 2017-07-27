let spider = require('./spider');

process.on('message', (num) => {
    (async () => {
        await spider(num);
        process.send(`i finished ${process.pid}`);
    })();
});

