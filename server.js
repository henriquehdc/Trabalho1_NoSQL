var express = require('express')
var app = express()
const redis = require('redis');

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.set('views', './views')

var senha

const cli = redis.createClient({
    password: 'UUekuJj2aIzv0BaIg47X9McZih4EwzMe',
    socket: {
        host: 'redis-13527.c322.us-east-1-2.ec2.cloud.redislabs.com',
        port: 13527
    }
});

app.get("/", async (req, res) => {
    let fila = await cli.lRange('fila', 0, -1)
    res.render('index', { senha: senha, fila: fila });
})

app.get("/proximo", async (req, res) => {
    senha = await cli.lPop('fila')
    res.render('proximo', {senha:senha});
})

app.get("/retirar", async (req, res) => {
    let ultimaSenha = await cli.lIndex('ListaSenha', -1)
    let novaSenha = parseInt(ultimaSenha) + 1
    await cli.rPush('ListaSenha', novaSenha.toString())
    await cli.rPush('fila', novaSenha.toString())
    res.render('retirarsenha', {senha:novaSenha});
});

async function start() {
    await cli.connect()
    console.log('Conectado ao redis')
    app.listen(8000, async () => {
        console.log('Servidor iniciado porta 8000')
        await cli.del('fila')
        await cli.del('ListaSenha')
        await cli.rPush('ListaSenha', ['0'])
        senha = await cli.lIndex('ListaSenha', 0)
    });
}
cli.on('connect', function (err) {
    if (err) {
      console.log('Could not establish a connection with Redis. ' + err);
    } else {
      console.log('Connected to Redis successfully!');
    }
  });

start()


