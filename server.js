
const express =require('express');
const app =express();
const bodyParser = require('body-parser');
const { Db } = require('mongodb');
app.use(bodyParser.urlencoded({extended:true}));
app.use('/public', express.static('public'));
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
require('dotenv').config()//환경변수

const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs')
var db;

MongoClient.connect(process.env.DB_URL,function(error,client){ //db접속 완료되면 밑에꺼실행.
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
    app.listen(process.env.PORT,function(){});// console.log("8080 success")
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

app.get('/detail/:id', function(요청, 응답){
  db.collection('post').findOne({ _id : parseInt(요청.params.id) }, function(에러, 결과){
    응답.render('detail.ejs', {data : 결과} )
  })
});

app.get('/edit/:id',function(요청,응답){
  db.collection('post').findOne({_id: parseInt(요청.params.id) },function(에러,결과){
    console.log(결과)
    if(결과==null){
      console.log('해당번호 없음')
    }
    응답.render('edit.ejs',{post:결과})
  })
})
app.put('/add', function(요청, 결과){ 
  db.collection('post').updateOne( {_id : parseInt(요청.body.id) }, {$set : { 제목 : 요청.body.title , 날짜 : 요청.body.date }}, 
    function(){ 
    console.log('수정완료') 
    응답.redirect('/list') 
  }); 
}); 

app.delete('/delete', function(요청, 응답){
  console.log(요청.body)
  요청.body._id = parseInt(요청.body._id);
  db.collection('post').deleteOne(요청.body, function(에러, 결과){ //오브젝트로 올땐 str로 되있기때문에 인트로 바꿔야함.
    console.log('삭제완료')
    응답.status(200).send({message : '성공'});
  })
});

app.put('/edit',function(요청,응답){
  db.collection('post').updateOne({_id: parseInt(요청.body.id)},{$set : {제목: 요청.body.title,날짜:요청.body.date}},
  function(에러,결과){
    console.log("수정완료");
    응답.redirect('/list')
  });
});
// 회원가입,로그인

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session()); 

app.get('/login', function(요청, 응답){
  응답.render('login.ejs')
})

app.get('/fail',function(요청, 응답){ 
  응답.render('fail.ejs')
})
app.get('/mypage',로그인했니 ,function(요청, 응답){ //mypage접속할때마다 로그인했니함수 실행
  console.log(요청.user)// deserializeUser
  응답.render('mypage.ejs',{사용자: 요청.user})
})
app.get('/mypage', 로그인했니, function (요청, 응답) {
  console.log(요청.user);
  응답.render('mypage.ejs', { 사용자: 요청.user })
}) 

function 로그인했니(요청,응답,next){ 
    if(요청.user){//요청.User가 있는지 검사
      next()//다음으로 통과
    }else{
      응답.send('로그인안했음')
    }
}

app.post('/login',passport.authenticate('local',{
  failureRedirect:'/fail'
}),function(요청,응답){
  응답.redirect('/');
})

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  session: true, //세션으로 저장할것인가?
  passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
  //console.log(입력한아이디, 입력한비번);
  db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
    if (에러) return done(에러)

    if (!결과) return done(null, false, { message: '존재하지않는 아이디요' }) //결과에 아무것도 안들어있을때
    if (입력한비번 == 결과.pw) {
      return done(null, 결과)
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  })
}));

passport.serializeUser(function (user, done) { 
  done(null, user.id)//id를 이용해 세선 저장시키는 코드
});

passport.deserializeUser(function (아이디, done) {//로그인한 유저의 개인정보를 DB에서 찾는 역활 
  db.collection('login').findOne({id: 아이디 },function(에러,결과){
    done(null, 결과) //마이페이지 접속시 발동
  })
  
}); 