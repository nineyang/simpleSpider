let spider = require('./spider');

process.on('message', (params) => {

    let num = 1;
    while (20 * (num + params[0]) <= 300) {
        (async () => {
            await spider(20 * (num + params[0]));
            process.send(`i have finished ${process.pid}`);
        })();
        num += params[1];
    }
});

