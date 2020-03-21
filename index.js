
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const path = require('path')
const app = express()
const mysql = require('mysql')
const moment = require('moment')

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

app.delete('/deletar/:id',function(req,res) {
  let id = req.params.id;
  let sql = `delete from produtos where id = ?`
  console.log("ou")
  connection.query(sql, [id], (error, results, fields) => {
      if (error) {
        res.status(500).send('erro')
      } else {
        res.send('del')
      }
      
});
});
/*
SELECT nome,(select sum(quantidade) from produto_venda pv where p.id = pv.produto_id)*100/(select sum(quantidade) from produto_venda) as porcentagem FROM produto_venda pv2
join produtos p on(p.id = pv2.produto_id)
group by nome;

*/
app.get('/graph',function(req,res){
  let sql = "select nome,(select sum(quantidade) from produto_venda pv where p.id = pv.produto_id)*100/(select sum(quantidade) from produto_venda) as porcentagem from produto_venda pv2 join produtos p on (p.id = pv2.produto_id) group by nome order by porcentagem desc limit 5;"
  connection.query(sql,function(error,results,fields){
    if(error) {
      console.log(error)
    }
    console.log('fort')
    res.json(results)
  })
})

// update produtos set categoria_id=8 where categoria_id = 2 or categoria_id = 7;
// update tarefas set descricao = 'aaaa' where id='24'
app.patch('/update',function(req,res) {
  let nome = req.body.nome
  let id = req.body.id;
  let valor = req.body.valor
  /*desc = desc.replace("+","'")
  desc = desc.replace("+","'")
  dataHora = dataHora.replace("+","'")
  dataHora = dataHora.replace("+","'")*/
  let sql = `update produtos set valor=?,nome=? where id=?`
  connection.query(sql,[valor,nome,id],(error,results,fields) => {
      if (error) {
          console.log("umas treta loca ai")
      }
      res.send("Atualizado os esquemas")
  });
});
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
    if(results[0] == null) {
      res.json("vazio")
      return;
    }
    res.json(results[0])
  });
});
app.post('/postVenda', function (req, res) {
  var sql = "INSERT INTO `vendas` (data_hora) VALUES ('" + req.body.dataHora + "')";
  connection.query(sql, function (err, result) {
    res.send("fala fi")
  });
});
app.post('/postVendaItem', function (req, res) {
  var data = new Date();
  var data = moment(data).format('YYYY-MM-DD HH:mm')
  console.log(data)
  connection.query("insert into vendas (data_hora) values ('" + data + "')", function (err, result) {
    var venda_id = result.insertId
    var array = req.body.itens
    for (let i = 0; i < array.length; i++) {
      var select = "(select valor from produtos where id = '" +array[i].produto_id+"')*'"+array[i].quantidade+"'"
      // INSERT INTO produto_venda (produto_id,venda_id,quantidade,valor_total) VALUES ('1','1','3', (select valor from produtos where id = '1')*3)
      var sql = "INSERT INTO `produto_venda` (produto_id,venda_id,quantidade,valor_total) VALUES ('" + array[i].produto_id + "', '" + venda_id + "','" + array[i].quantidade + "'," +select + ")";
      connection.query(sql, function (err, result) {
        console.log(err)
      });
    }
  });
});

/*
var venda_id;
connection.query("select id from vendas ",function(err,results,fields) {
  console.log(results.length)
  venda_id = results.length
})
 
}
*/


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
      if (error) {
        res.json(error);
        console.log(error)
      }
        res.json(results);
      //connection.end();
      
    });
});
app.use('/editProduto/:id',function(req,res){
  res.sendFile(path.join(__dirname,'public','Novoproduto.html'))
  /*
  let json = {
    'nome':req.params.nome,
    'valor':req.params.valor,
    'id':req.params.id
  }
  res.send(json)
  */

})
app.use('/topCinco', function(req,res){
  res.sendFile(path.join(__dirname, 'public','produtosVendidos.html'))
})
app.use('/hori', function(req,res){
  res.sendFile(path.join(__dirname, 'public','graphorizo.html'))
})
app.use('/cadProduto', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'Novoproduto.html'));
  //C:\Users\Matheus\Desktop\an
});
app.use('/cadVenda', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'cadVenda.html'));
  //C:\Users\Matheus\Desktop\an
});
app.use('/listProduto', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'listProduto.html'));
  //C:\Users\Matheus\Desktop\an
});
app.use('/listVenda', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'listVenda.html'));
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
