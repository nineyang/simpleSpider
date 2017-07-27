let superagent = require('superagent'), fs = require('fs');
let url = 'https://movie.douban.com/j/search_subjects', filePath = './data/movie.json';

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
                let movies = JSON.parse(fs.readFileSync(filePath, 'utf8')), text = JSON.parse(res.text);
                if (movies.subjects != undefined) {
                    Object.keys(text.subjects).forEach((key) => {
                        movies.subjects.push(text.subjects[key]);
                    });
                } else {
                    movies.subjects = text.subjects;
                }
                fs.writeFile('./data/movie.json', JSON.stringify(movies), (err) => {
                    if (err) return reject(err);
                    console.log('ok');
                    return resolve('write success');
                });
            })
    });
};