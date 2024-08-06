const http = require('http');
const fs = require('fs');
const path = require('path');

// server
http
  .createServer((req, res) => {
    // корень = /
    // загружаем файл в uploads
    // статика
    console.log(`req: ${req.url}`);
    if (req.url === '/') {
      sendRes('index.html', 'text/html', res);
    } else if (/\/uploads\/[^\/]+$/.test(req.url) && req.method === 'POST') {
      console.log('upload files');
      saveUploadFile(req, res);
    } else {
      sendRes(req.url, getContentType(req.url), res);
    }
  })
  .listen(5500, () => {
    console.log('server start 3000');
  });

// отправка ресурсов

function sendRes(url, contentType, res) {
  let file = path.join(__dirname + '/static/', url);
  fs.readFile(file, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.write('file not found');
      res.end();
      console.log(`error 404 ${file}`);
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.write(content);
      res.end();
      console.log(`res 200 ${file}`);
    }
  });
}

// тип контента
function getContentType(url) {
  switch (path.extname(url)) {
    case '.html':
      return 'text/html';
    case '.css':
      return 'text/css';
    case '.js':
      return 'text/javascript';
    case '.json':
      return 'application/json';
    default:
      return 'application/octate-stream';
  }
}

// сохранение файла
function saveUploadFile(req, res) {
  let fileName = path.basename(req.url);
  let file = path.join(__dirname, 'uploads', fileName);
  let imageFolder = path.join(__dirname, 'static/images', fileName);

  req.pipe(fs.createWriteStream(file));
  req.on('end', () => {
    fs.copyFile(file, imageFolder, (err) => {
      if (err) {
        console.log(err);
      }
      fs.unlink(file, (err) => {
        if (err) {
          console.log(err);
        }
      });
    });
    res.writeHead(200, { 'Content-Type': 'text' });
    res.write(fileName);
    res.end();
  });
}
