## 前言
最近有看`Node`的多进程，所以用`Node`的`cluster`写了一个抓取豆瓣电影的小玩意(豆瓣表示，为什么你们每次写爬虫都喜欢拿我举例子...)。
`Node`的`cluster`模块写的非常细，各种[Api](http://nodejs.cn/api/cluster.html#cluster_cluster)也写得非常详细，接下来我会梳理一下我大致的流程。
代码已经上传到[GitHub](https://github.com/nineyang/simpleSpider)。

## 流程
首先我们先根据官方提供的接口写一个简单的可运行的demo:
```javascript
let cluster = require('cluster'), cpuNums = require('os').cpus().length;

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
```
运行结果:

![e093f1a3-b69c-4d2f-aa08-c6e48f2b4565.png][1]

正如上图所示，我们会根据我们运行服务器的cpu核数来分配`worker`，也就是我们所说的多进程，来帮助我们去同步分化实现一个耗时很长的执行流程。
`cluster.fork()`会帮助我们新建一个新的工作进程，当然，正如`worker`可以`send`，`process`可以监听`message`，我们的`cluster`其实也可以监听`fork`，来帮助我们去实现一些初始化的工作。具体的更多的`api`请参考官方文档。

虽然说我们初步实现了一个简单的多进程，但是有没有发现，其实这里面有一个较大的问题，那就是我们每次`fork`的时候，整个流程都会重新执行一次，我们可以加一行代码予以验证:

![330afc80-ffe3-45b1-9564-1c845d43aeff.png][2]

这很显然不符合我们在工作中的实际流程，因此，我们可以继续阅读官方的文档，一定有提供另外的方法来让我们的`master`和`worker`分离。果然，我们很快就找到了我们想要的[结果](http://nodejs.cn/api/cluster.html#cluster_cluster_setupmaster_settings):
>用于修改默认'fork' 行为。一旦调用，将会按照cluster.settings进行设置。

通过阅读官方文档，我们发现，其实是有提供一个`clusterMaster`的方法，来辅助我们构建我们的`worker`，因此，我们可以通过这个方法来帮助我们达到实现分离的目的。

```javascript
let cluster = require('cluster'), cpuNums = require('os').cpus().length;

//生成新进程时的配置
// demo_2_mastet.js
cluster.setupMaster({
    exec: 'demo_2_worker.js',
    args: ['--use', 'http']
});

for (let i = 0; i < cpuNums; ++i) {
    let worker = cluster.fork();

    worker.send('hello , this is from master');
}
```

```javascript
// demo_2_worker.js
process.on('message', (msg) => {
    console.log(msg);
    console.log(`i have received your message , my pid is ${process.pid}`);
});
```

![59425e11-9154-44d6-a5b9-591f4e76f292.png][3]


很显然，我们的分离是有作用的，这样，我们离我们的多进程爬虫就又进了一步。

接下来就是我们要抓取的过程了，抓取主要是采用了[superagent](https://cnodejs.org/topic/5378720ed6e2d16149fa16bd)这个模块来帮助我们实现，API非常的简单，而豆瓣的接口也非常方便分析，这里就不多赘述了，这里特别感谢[豆瓣](https://www.douban.com/)。

```javascript
// spider.js
let superagent = require('superagent'), fs = require('fs');
let url = 'https://movie.douban.com/j/search_subjects', filePath = './data/movie.txt';

module.exports = (page) => {
    return new Promise((resolve, reject) => {
        superagent
            .get(url)
            .query({
                'type': 'movie',
                'tag': '热门',
                'sort': 'recommend',
                'page_limit': 20,
                'page_start': page
            })
            .set('Accept', 'application/json, text/javascript, */*; q=0.01')
            .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
            .end(function (err, res) {
                fs.appendFile(filePath, res.text, (err) => {
                    if (err) return reject(err);
                    console.log('ok');
                    return resolve('write success');
                })
            })
    });
};

```
这样，我们就能把最近热门的电影放到我们的`movie.txt`文件中了。


  [1]: http://www.hellonine.top/usr/uploads/2017/07/4227312634.png
  [2]: http://www.hellonine.top/usr/uploads/2017/07/346284658.png
  [3]: http://www.hellonine.top/usr/uploads/2017/07/1524304654.png