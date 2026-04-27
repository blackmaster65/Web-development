// REST API
const http = require('http');
const fs = require('fs');

const PORT = 3000;
const FILE = 'movies.json';

// helper read data
function readData(callback) {
    fs.readFile(FILE, 'utf8', (err, data) => {
        if (err) {
            callback([]);
        } else {
            callback(JSON.parse(data || '[]'));
        }
    });
}

// helper write data
function writeData(data, callback) {
    fs.writeFile(FILE, JSON.stringify(data, null, 2), callback);
}

// create server
const server = http.createServer((req, res) => {

    const url = req.url;
    const method = req.method;

    //GET ALL
    if (url === '/movies' && method === 'GET') {
        readData((movies) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(movies));
        });
    }

    //GET BY ID
    else if (url.startsWith('/movies/') && method === 'GET') {
        const id = parseInt(url.split('/')[2]);

        readData((movies) => {
            const movie = movies.find(m => m.id === id);

            if (movie) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(movie));
            } else {
                res.writeHead(404);
                res.end('Movie not found');
            }
        });
    }

    //CREATE
    else if (url === '/movies' && method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            const newMovie = JSON.parse(body);

            readData((movies) => {
                newMovie.id = movies.length ? movies[movies.length - 1].id + 1 : 1;
                movies.push(newMovie);

                writeData(movies, () => {
                    res.writeHead(201);
                    res.end('Movie added');
                });
            });
        });
    }

    // UPDATE
    else if (url.startsWith('/movies/') && method === 'PUT') {
        const id = parseInt(url.split('/')[2]);
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            const updatedData = JSON.parse(body);

            readData((movies) => {
                const index = movies.findIndex(m => m.id === id);

                if (index !== -1) {
                    movies[index] = { ...movies[index], ...updatedData };

                    writeData(movies, () => {
                        res.writeHead(200);
                        res.end('Movie updated');
                    });
                } else {
                    res.writeHead(404);
                    res.end('Movie not found');
                }
            });
        });
    }

    //DELETE
    else if (url.startsWith('/movies/') && method === 'DELETE') {
        const id = parseInt(url.split('/')[2]);

        readData((movies) => {
            const newMovies = movies.filter(m => m.id !== id);

            writeData(newMovies, () => {
                res.writeHead(200);
                res.end('Movie deleted');
            });
        });
    }

    //NOT FOUND
    else {
        res.writeHead(404);
        res.end('Route not found');
    }
});

// start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});