const express =require('express');
const app =express();
const bodyParser = require('body-parser');
const { Db } = require('mongodb');
app.use(bodyParser.urlencoded({extended:true}));

const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs')
var db;

MongoClient.connect('mongodb+srv://kjkj2077:38941k@cluster0.rodcisa.mongodb.net/?retryWrites=true&w=majority',function(error,client){ //db접속 완료되면 밑에꺼실행.
    if(error) return console.log(error);
   
    db=client.db('todoapp');
    db.collection('post').insertOne({_id : 1,이름:'John',나이:20},function(err,res){
        console.log('저장완료');
    });
    app.post('/add',function(req,res){
        res.send('전송완료');
        db.collection('post').insertOne({제목 :req.body.title ,날짜 :req.body.date},function(err,res){
            console.log('저장완료');
        });
    })
    

    app.listen(8080,function(){
        console.log("8080 success")
    });
    
})

app.get('/pet',(req,res) =>{
    res.send("hello!!")
})

app.get('/',function(req,res){
    res.sendFile(__dirname+"/index.html")
})
app.get('/write',function(req,res){
    res.sendFile(__dirname+"/write.html")
})

app.post('/add',function(req,res){
    res.send('전송완료');
    console.log(req.body.title)
    console.log(req.body.date)
    db.collection('post').insertOne({제목 :req.body.title ,날짜 :req.body.date},function(err,res){
        console.log('저장완료');
    });
})

app.get('/list',function(req,res){
    res.render('list.ejs');
})


