const mysql = require('mysql')
const express = require('express')
const app = express()
const cors = require('cors')
var bodyParser = require('body-parser')
app.use(bodyParser.json());
const JWT = require('./login/jwt.js')
// app.use(function (req, res, next) {
//     // 我这里知识把登陆和注册请求去掉了，其他的多有请求都需要进行token校验 
//     if (req.url != '/login' && req.url != '/regis') {
//         let token = req.headers.anthorization;
//         let result = JWT.verifyToken(token);
//         // 如果考验通过就next，否则就返回登陆信息不正确
//         if (result === 'true') {
//             console.log('false')
//             res.send({status: 403, msg: '登录已过期,请重新登录'});
//             //  res.render('index.html');
//         } else {
//             next();
//         }
//     } else {
//         next();
//     }
// });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser());
app.use(cors())
app.listen(8090,()=>{
    console.log('running at')
})
const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '1156344184Lh',
    database: 'blog',
})
// const db = mysql.createPool({
//     host: '62.234.92.22',
//     user: 'clarca',
//     password: 'JyKRn6FGGD2EiA8m',
//     database: 'clarca',
// })
// const atr = 'select * from blogtext'
// db.query(atr,(err,result)=>{
// })
app.get('/title',(req,res)=>{
    const query = req.query
    const str = `select * from blogtext where id = ${query.id}`
    db.query(str,(err,result)=>{
        if(err) console.log(err)
        else res.send(result)
    })
})
app.get('/blogtext',(req,res)=>{
const atr = 'select * from blogtext'
db.query(atr,(err,result)=>{
res.send(result)
})
})
app.post('/blogtext2',(req,res)=>{
    const query = req.body
    const str = 'insert into blogtext(title,text,time,id,fl) values(?,?,?,?,?)'
    db.query(str,[query.data.title,query.data.content,query.data.time,query.data.id,query.data.fl],(err,result)=>{
        if(err) console.log(err)
        else console.log('sucess')
    res.send('yess')
    })
})
app.get('/opp',(req,res)=>{
    const query = req.query
    const str = `select * from content where id = ${query.id}`
     db.query(str,(err,result)=>{
        res.send(result)
    })
})
app.get('/me',(req,res)=>{
    const str = 'select text from message'
    db.query(str,(err,result)=>{
        res.send(result)
    })
})
app.post('/views',(req,res)=>{
    const query = req.body
    const str = `insert into lyb(name,text,time) values(?,?,?)`
    db.query(str,[query.data.name,query.data.text,query.data.time],(err,result)=>{
        if(err) console.log(err)
        else console.log('sucess')
    })
})
app.get('/views',(req,res)=>{
    const str = 'select * from lyb'
    db.query(str,(err,result)=>{
        if(err) console.log(err)
        else res.send(result)
    })
})
app.post('/regis',(req,res)=>{
    const query = req.body
    res.send({
        status: 0,
        msg: 'success',
        data: query
    })
    const sqlstr = `insert into login (account, passwords, states) values (?,?,1)`
    db.query(sqlstr,[query.data.account,query.data.passwords],(err,results)=>{
      if(err)return console.log(err.message)
      if(results.affectedRows ===1)
      console.log('success')
    })
})
// 登录
app.get('/regis',(req,res)=>{
    const query = req.query
    const sqlstr = `select states from login where account="${query.account}"&&passwords="${query.passwords}"`
    db.query(sqlstr,(err,results)=>{
        if(err)return console.log(err)
        if(results.affectedRows ===1)
      console.log('get success')
    if(results.length ===1 )
    {
        const token = JWT.createToken(query.account,'1h')
        console.log(token)
        res.send({
            data:{
                results,
                token
            }
        })
        return 
    }
        res.send(results)
    })
})
app.get('/numviews',(req,res)=>{
    const str = 'select * from lyb'
    db.query(str,(err,result)=>{
        if(err) console.log(err)
        else res.send(result)
    })
})
app.get('/numvisitor',(req,res)=>{
    const str = 'select * from login'
    db.query(str,(err,result)=>{
        if(err) console.log(err)
        else res.send(result)
    })
})
app.post('/markdown',(req,res)=>{
    const query = req.body
    const str = `insert into test(text) values("${query.data.content}")`
    db.query(str,(err,result)=>{
        if(err) console.log(err)
        else console.log('yess')
    res.send('yess')
    })
})
app.post('/senddd',(req,res)=>{
const query = req.body
const MarkdownIt = require('markdown-it')
const hljs = require('highlight.js')
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
  	// 此处判断是否有添加代码语言
    if (lang && hljs.getLanguage(lang)) {
      try {
      	// 得到经过highlight.js之后的html代码
        const preCode = hljs.highlight(lang, str, true).value
        // 以换行进行分割
        const lines = preCode.split(/\n/).slice(0, -1)
        // 添加自定义行号
        let html = lines.map((item, index) => {
          return '<li><span class="line-num" data-line="' + (index + 1) + '"></span>' + item + '</li>'
        }).join('')
        html = '<ol>' + html + '</ol>'
        // 添加代码语言
        if (lines.length) {
          html += '<b class="name">' + lang + '</b>'
        }
        return '<pre class="hljs"><code>' +
          html +
          '</code></pre>'
      } catch (__) {}
    }
	// 未添加代码语言，此处与上面同理
    const preCode = md.utils.escapeHtml(str)
    const lines = preCode.split(/\n/).slice(0, -1)
    let html = lines.map((item, index) => {
      return '<li><span class="line-num" data-line="' + (index + 1) + '"></span>' + item + '</li>'
    }).join('')
    html = '<ol>' + html + '</ol>'
    return '<pre class="hljs"><code>' +
      html +
      '</code></pre>'
  }
})
    const ll = md.render(query.data.content)
    const str = "insert into content(content,id) values(?,?)"
    db.query(str,[ll,query.data.id],(err,result)=>{
        if(err) console.log(err)
        else console.log('yes') 
    res.send('yes')
    })
})
app.get('/senddd',(req,res)=>{
    const query = req.query
    const str = `select * from content where id = ${query.id}`
    db.query(str,(err,result)=>{if(err) console.log(err)
        else res.send(result)})
})
app.get('/flqd',(req,res)=>{
    const query = req.query
    const str = `select * from blogtext where fl like "%${query.fl}%"`
    db.query(str,(err,result)=>{
        if(err) console.log(err)
        else res.send(result)
    })
})
app.get('/search',(req,res)=>{
    const query = req.query
    const str = `select * from blogtext where text like "%${query.value}%" || title like "%${query.value}%"`
    db.query(str,(err,result)=>{
    if(err) console.log(err)
        else console.log(result)
    res.send(result)
    })
})
app.get('/mount',(req,res)=>{
    const str = `select * from blogtext where fl like "%前端%"`
    db.query(str,(err,result)=>{
        if(err) console.log(err)
        else 
    res.send(result)
    })
})
app.get('/mount1',(req,res)=>{
    const str = 'select * from blogtext where fl = "后端"'
    db.query(str,(err,result)=>{
        if(err) console.log(err)
        else 
    res.send(result)
    })
})
app.get('/mount2',(req,res)=>{
    const str = 'select * from blogtext where fl = "数据库"'
    db.query(str,(err,result)=>{
        if(err) console.log(err)
        else 
    res.send(result)
    })
})
app.get('/mount3',(req,res)=>{
    const str = 'select * from blogtext where fl = "其他"'
    db.query(str,(err,result)=>{
        if(err) console.log(err)
        else 
    res.send(result)
    })
})