
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

app.get('/vendas/mes', function (req, res) {
  let ano = new Date();
  ano = ano.getFullYear()
  console.log(ano);

  connection.query(`select data_hora,sum(valor_total) as valor_total from vendas v join produto_venda pv on(pv.venda_id = v.id) where extract(year from data_hora) = '${ano}'  group by extract(month from data_hora)`,
    (erro, results, fields) => {
      if (erro) {
        console.log(erro);

        res.send({ erro: 'errro' })
      }

      results.forEach(element => {
        let mes = new Date()
        mes.get
        console.log(element);

        element.data_hora = moment(element.data_hora).format('MMMM')

      })
      console.log(results);

      res.json(results)
    })
})

app.get('/logar', function (req, res) {
  let sql = 'select nome,senha from usuarios'
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.log(error);
      return;
    }
    res.json(results)
  })
})

app.get('/vendas', function (req, res) {


  let datade = req.query.datade
  let dataate = req.query.dataate
  datade = moment(datade).format('YYYY-MM-DD')
  dataate = moment(dataate).format('YYYY-MM-DD')
  console.log('dataate ' + dataate)
  console.log('datede ' + datade);

  // connection.query(`select id,quantidade,venda_id,(select data_hora from vendas v where v.id = pv.venda_id and data_hora > ${datade} and data_hora < ${dataate}) as data_hora,valor_total from produto_venda pv order by data_hora desc`,
  connection.query(` select v.id,data_hora,sum(quantidade) as quantidade,sum(valor_total) as valor_total from vendas v join produto_venda pv on (pv.venda_id = v.id) where data_hora between '${datade}' and '${dataate}' group by v.id`,
    (erro, results, fields) => {


      if (erro) {
        res.send({ erro: 'errro' })
      }
      console.log(results.length);

      results.forEach(element => {
        console.log(element);

        element.data_hora = moment(element.data_hora).format('DD/MM/YYYY HH:mm')

      })
      res.json(results)
    })
})

app.delete('/deletar/:id', function (req, res) {
  let id = req.params.id;
  let sql = `delete from produtos where id = ?`
  console.log("ou")
  connection.query(sql, [id], (error, results, fields) => {
    if (error) {
      res.status(500).json({ erro: 'erro' })
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
app.get('/graph', function (req, res) {
  let sql = "select nome,(select sum(quantidade) from produto_venda pv where p.id = pv.produto_id)*100/(select sum(quantidade) from produto_venda) as porcentagem,(select sum(valor_total) from produto_venda) as total,(select sum(valor_total) from produto_venda where p.id = produto_id) as valor_produto from produto_venda pv2 join produtos p on (p.id = pv2.produto_id) group by nome order by porcentagem desc limit 5"
  connection.query(sql, function (error, results, fields) {
    if (error) {
      console.log(error)
    }
    console.log('fort')
    res.json(results)
  })
})

// update produtos set categoria_id=8 where categoria_id = 2 or categoria_id = 7;
// update tarefas set descricao = 'aaaa' where id='24'
app.post("/produto/update", function (req, res) {
  console.log('eu sie')
  let nome = req.body.nome
  let id = req.body.id;
  let valor = req.body.valor
  valor = validarCampos(valor, nome, res)
  console.log(boolean)
  if (boolean == false) {
    return;
  }
  /*desc = desc.replace("+","'")
  desc = desc.replace("+","'")
  dataHora = dataHora.replace("+","'")
  dataHora = dataHora.replace("+","'")*/
  let sql = `update produtos set valor=?,nome=? where id=?`
  connection.query(sql, [valor, nome, id], (error, results, fields) => {
    if (error) {
      console.log("umas treta loca ai")
    }
    res.json({ erro: 'salvo' })
  });
});

// select id,quantidade,venda_id,(select data_hora from vendas v where v.id = venda_id),valor_total from produto_venda pv
app.get('/getVendas', function (req, res) {
  console.log(req.body.obj);

  let select = `(select data_hora from vendas v where v.id = venda_id )`
  connection.query(`select data_hora,v.id,sum(quantidade) as quantidade,sum(valor_total) as valor_total from vendas v join produto_venda pv on(pv.venda_id = v.id) where extract(month from current_date) = extract(month from data_hora) and extract(year from current_date) = extract(year from data_hora) group by v.id order by data_hora desc`,
    function (error, results, fields) {
      if (error)
        res.json(error);
      else
        results.forEach(element => {
          element.data_hora = moment(element.data_hora).format('DD/MM/YYYY HH:mm')
        });
      res.json(results);
      //connection.end();
    });
});
app.get('/produto/:id', function (req, res) {
  let id = req.params.id;
  let sql = 'select id,nome,valor from produtos where id=?'
  connection.query(sql, id, (error, results, fields) => {
    console.log(results)
    if (error) {
      console.log("erro do bao")
    }
    if (results[0] == null) {
      res.json("vazio")
      return;
    }
    console.log(results[0])
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
      var select = "(select valor from produtos where id = '" + array[i].produto_id + "')*'" + array[i].quantidade + "'"
      // INSERT INTO produto_venda (produto_id,venda_id,quantidade,valor_total) VALUES ('1','1','3', (select valor from produtos where id = '1')*3)
      var sql = "INSERT INTO `produto_venda` (produto_id,venda_id,quantidade,valor_total) VALUES ('" + array[i].produto_id + "', '" + venda_id + "','" + array[i].quantidade + "'," + select + ")";
      connection.query(sql, function (err, result) {
        console.log(err)
      });
    }
  });
});
app.post('/produto/inserir', function (req, res) {
  let n = req.body.valor
  let p = req.body.nome
  boolean = true;
  n = validarCampos(n, p, res)
  console.log(boolean);

  if (boolean == false) {
    return;
  }
  console.log('a to');

  var sql = "INSERT INTO `produtos` (`nome`,`valor`) VALUES ('" + p + "', '" + n + "')";
  connection.query(sql, function (err, result) {
    res.send({ erro: 'salvo' })
  });
});
var boolean = true;
function validarCampos(n, p, res) {
  let b = true
  if (!isNaN(n)) {
    console.log('eror nu')
    boolean = false
    res.status(500).send({ erro: 'Valor inválido' })
    return;
  }
  if (p == '' || p.length < 2) {
    console.log('o')
    boolean = false
    res.status(500).send({ erro: 'Nome não pode ser nulo' })
    return;
  }
  let s = p.split('')
  for (let i = 0; i < s.length; i++) {
    if (!isNaN(s[i])) {
      console.log('o')
      boolean = false
      res.status(500).send({ erro: 'Não pode conter números no nome ' })
      return;
    }
  }
  n = n.replace('R$', "")
  n = n.replace('.', '')
  n = n.replace(',', '.')
  n = parseFloat(n).toFixed(1)
  return n;
}
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
app.use('/editProduto/:id', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'Novoproduto.html'))
  /*
  let json = {
    'nome':req.params.nome,
    'valor':req.params.valor,
    'id':req.params.id
  }
  res.send(json)
  */

})
app.use('/vendas/grafico', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'graphVendas.html'))
})
app.use('/topCinco', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'produtosVendidos.html'))
})
app.use('/hori', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'graphorizo.html'))
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
app.use('/home', function (req, res) {
  console.log('ai')
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
  //C:\Users\Matheus\Desktop\a
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
