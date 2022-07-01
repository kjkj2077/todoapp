const express =require('express');
const app =express();
const bodyParser = require('body-parser');
const { Db } = require('mongodb');
app.use(bodyParser.urlencoded({extended:true}));
app.use('/public', express.static('public'));

const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs')
var db;

MongoClient.connect('mongodb+srv://kjkj2077:38941k@cluster0.rodcisa.mongodb.net/?retryWrites=true&w=majority',function(error,client){ //db접속 완료되면 밑에꺼실행.
    if(error) return console.log(error);
   
    db=client.db('todoapp');
    console.log('db,8080실행완료');
    app.post('/add', function (요청, 응답) {
        db.collection('counter').findOne({name : '게시물갯수'}, function(에러, 결과){
          var 총게시물갯수 = 결과.totalPost
          db.collection('post').insertOne({ _id : 총게시물갯수+1, 제목 : 요청.body.title, 날짜 : 요청.body.date }, function (에러, 결과) {
            db.collection('counter').updateOne({name:'게시물갯수'},{ $inc: {totalPost:1} },function(에러, 결과){
          if(에러){return console.log(에러)}
              응답.send('전송완료');
            })
          })
        })
      })
    app.listen(8080,function(){});// console.log("8080 success")
})

app.get('/',function(req,res){
    // res.sendFile(__dirname+"/index.html")
    res.render('index.ejs')
})
app.get('/write',function(req,res){
    // res.sendFile(__dirname+"/write.html")
    res.render('write.ejs')
})

app.get('/list', function(요청, 응답){
    db.collection('post').find().toArray(function(err, result){
    //db에 저장된 post라는 collection안의 모든 데이터 꺼내주세요
    응답.render('list.ejs', { posts : result })
    })
})


// app.get('/detail/:id', function(요청, 응답){
//   db.collection('post').findOne({ _id : parseInt(요청.params.id) }, function(에러, 결과){
//     응답.render('detail.ejs', {data : 결과} )
//   })
// });

app.get('/detail/:id', function(요청, 응답){
  db.collection('post').find().toArray(function(err, result){
      응답.render('detail.ejs', { posts : result })
    })
});
// app.get('/detail/:id', function(요청, 응답){
//   db.collection('post').findOne({ _id : 요청.params.id }, function(에러, 결과){
//     응답.render('detail.ejs', {data : 결과} )
//   })
// });


app.delete('/delete', function(요청, 응답){
  console.log(요청.body)
  요청.body._id = parseInt(요청.body._id);
  db.collection('post').deleteOne(요청.body, function(에러, 결과){ //오브젝트로 올땐 str로 되있기때문에 인트로 바꿔야함.
    console.log('삭제완료')
    응답.status(200).send({message : '성공'});
  })
});

