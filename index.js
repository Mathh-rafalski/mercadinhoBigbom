
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const path = require('path')
const app = express()
const mysql = require('mysql')
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'banquito'
})
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))


app.get('/produto/:id', function (req, res) {
  let id = req.params.id;
  console.log(id)
  let sql = 'select nome,valor from produtos where id=?'
  connection.query(sql, id, (error, results, fields) => {
    if (error) {
      console.log("erro do bao")
    }
    res.json(results)
  });
});
app.get('/getProdutos', function (req, res) {
  connection.query('select nome,valor,id from produtos',
    function (error, results, fields) {
      if (error)
        res.json(error);
      else
        res.json(results);
      //connection.end();
    });
  });
  app.use('/cadProduto', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'Novoproduto.html'));
    //C:\Users\Matheus\Desktop\an
  });
  app.post('/postProd', function (req, res) {
    console.log(req.body.dataHora);
    var sql = "INSERT INTO `produtos` (`nome`,`valor`) VALUES ('" + req.body.nome + "', '" + req.body.valor + "')";
    connection.query(sql, function (err, result) {
      res.send("fala fi")
    });
  });
  app.use('/', function (req, res) {
    console.log('ai')
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
    //C:\Users\Matheus\Desktop\a
  });
  app.use('/produtos', function (req, res) {
    console.log("açlo");

    res.sendFile(path.join(__dirname, 'public', 'index.html'));
    //C:\Users\Matheus\Desktop\a
  });




var server = app.listen(80)
