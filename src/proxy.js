const http = require("http");
const { Transform } = require("stream");

function startProxy(config, incoming, outgoing) {
  function onRequest(client_req, client_res) {
    let state;
    const options = {
      hostname: "localhost",
      port: config.dbPort || 8000,
      path: client_req.url,
      method: client_req.method,
      headers: client_req.headers,
    };
    const proxy = http.request(options, function (res) {
      const transform = new Transform({
        objectMode: true,
        async transform(chunk, _, callback) {
          await outgoing(state);
          callback(null, chunk);
        },
      });

      client_res.writeHead(res.statusCode, res.headers);
      res.pipe(transform);

      transform.pipe(client_res, {
        end: true,
      });
    });

    const transform = new Transform({
      objectMode: true,
      async transform(chunk, _, callback) {
        const body = JSON.parse(chunk.toString());
        state = await incoming({ body, headers: client_req.headers });
        callback(null, chunk);
      },
    });

    client_req.pipe(transform);
    transform.pipe(proxy, {
      end: true,
    });
  }

  return new Promise((resolve) => {
    const server = http.createServer(onRequest);
    server.listen(config.proxtPort || 5000, () => {
      resolve(server);
    });
  });
}

module.exports = startProxy;
