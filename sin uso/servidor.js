const http = require('http');
const fs = require('fs');
const path = require('path');

const servidor = http.createServer((req, res) => {
    console.log('Solicitud nueva:', req.url);
    console.log('===> req (solicitud)');
    console.log(req.url);
    console.log(req.method);
    console.log(req.headers);
    


    // Configura la ruta del archivo
    let filePath = '.' + req.url;
    if (filePath == './') {
        filePath = './index.html'; // Cambia a tu archivo de inicio si es necesario
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.svg': 'application/image/svg+xml'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                fs.readFile('./404.html', (error, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                res.writeHead(500);
                res.end('Error interno del servidor: ' + error.code + ' ..\n');
                res.end();
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        } 
            console.log('===> res (aqui la respuesta)');
            console.log(res.statusCode);
        
    });
});

servidor.listen(3000, () => {
    console.log('El servidor está escuchando en http://localhost:3000');
});
