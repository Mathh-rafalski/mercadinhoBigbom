
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

app.get('/getVendas', function (req, res) {
  connection.query('select id,data_hora from vendas',
    function (error, results, fields) {
      if (error)
        res.json(error);
      else
        res.json(results);
      //connection.end();
    });
  });
app.get('/produto/:id', function (req, res) {
  let id = req.params.id;
  console.log(id)
  let sql = 'select id,nome,valor from produtos where id=?'
  connection.query(sql, id, (error, results, fields) => {
    if (error) {
      console.log("erro do bao")
    }
    res.json(results)
  });
});
app.post('/postVenda', function(req,res) {
  let venda_id;
  var sql = "INSERT INTO `vendas` (data_hora) VALUES ('" + req.body.dataHora+ "')";
  connection.query(sql, function (err, result) {
    res.send("fala fi")
  });
});
app.post('/postVendaItem', function(req,res) {
  var data = Date();
  connection.query("insert into vendas (data_hora) values ('"+data+"')",function(err,result) {

  })
  connection.query("select id from vendas ",function(err,results,fields) {
    venda_id = results
  })
  console.log(req.body.json)
  var sql = "INSERT INTO `produto_venda` (produto_id,venda_id,quantidade,valor_total) VALUES ('" + req.body.produto_id + "', '" + venda_id + "','"+req.body.quantidade+"','"+req.body.valor_total+"')";
  connection.query(sql, function (err, result) {
    res.send("fala fi")
  });
});
/*BEGIN;
INSERT INTO users (username, password)
  VALUES('test', 'test');
INSERT INTO profiles (userid, bio, homepage) 
  VALUES(LAST_INSERT_ID(),'Hello world!', 'http://www.stackoverflow.com');
COMMIT;
*/
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
  app.use('/cadVenda', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'cadVenda.html'));
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
