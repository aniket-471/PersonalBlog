//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose=require("mongoose")
const session = require('express-session')
const flash = require('connect-flash')
const passport=require('passport')
const passportLocalMongoose=require('passport-local-mongoose')

// const Blog=require('./models/blog.js')
// const Register=require('./models/register.js')


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();
// var cors = require('cors');
// app.use(cors());
const mongoDB="mongodb://localhost:27017/blog"

mongoose.connect(mongoDB)

app.listen(5000, function() {
  console.log("Server started on port 5000");
});


// app.get('/users', (req, res)=>{
//   res.send(['Aniket', 'Amit', 'Divya'])
// })
// const blogSchema=new mongoose.Schema({
//   title:String,
//   content:String
// })

// const Blog=mongoose.model("Blog", blogSchema)
/////////////////////////////Blog////////////////////////////////////////////

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: 'AniketTheGoogler',
  resave: true,
  saveUninitialized: true,
 
}))

app.use(passport.initialize())
app.use(passport.session())

const registerSchema=new mongoose.Schema({
  email:String,
  password:String,
  
})

registerSchema.plugin(passportLocalMongoose)
const Register=mongoose.model('Register', registerSchema)

passport.use(Register.createStrategy());
passport.serializeUser(Register.serializeUser());
passport.deserializeUser(Register.deserializeUser());

const blogSchema=new mongoose.Schema({
  title:String,
  content:String
})
const Blog=mongoose.model('Blog', blogSchema)

const blog1=new Blog({
  title:"day1",
  content:"good start"
})

const blog2=new Blog({
  title:"day2",
  content:"good"
})



let posts = [blog1, blog2];

// Blog.insertMany(posts).then(function(){
//   console.log('data inserted')
// }).catch(function(error){
//   console.log(error)
// })

app.get('/', (req, res)=>{
  res.render('home.ejs')
})

app.get("/main", function(req, res){
  // res.render("home", {
  //   startingContent: homeStartingContent,
  //   posts: posts
  //   });
  if(req.isAuthenticated()){
    Blog.find({}).then(function(blogs){
      if(blogs.length===0){
        Blog.insertMany(posts).then(function(){
          console.log('data inserted')
        }).catch(function(err){
          console.log(err)
        })
        res.redirect('/main')
      }
      else
      {res.render('main.ejs', {startingContent: homeStartingContent,posts: blogs})}
    }).catch(function(error){
      console.log(error)
    })
  }
  else{
    res.redirect('/login')
  }

});

app.get("/about", function(req, res){
  
  if(req.isAuthenticated()){
    res.render("about", {aboutContent: aboutContent});
}
  else{
    res.redirect('/login')
}
});

app.get("/contact", function(req, res){
  
  if(req.isAuthenticated()){
    res.render("contact", {contactContent: contactContent});
}
  else{
    res.redirect('/login')
}

});

app.get("/compose", function(req, res){
  
  if(req.isAuthenticated()){
    res.render('compose')
}
  else{
    res.redirect('/login')
}
});

app.post("/compose", function(req, res){
  // const post = {
  //   title: req.body.postTitle,
  //   content: req.body.postBody
  // };
  // posts.push(post);

  const newblog=new Blog({
    title:req.body.postTitle,
    content:req.body.postBody
  })

  newblog.save()
  res.redirect("/main");

});

app.post('/delete', (req, res)=>{
  const id=req.body.button
  Blog.findByIdAndRemove(id).then(function(){
    res.redirect("/main");
  }).catch(function(err){
    console.log(err)
  })
})

app.get("/posts/:postName", function(req, res){
  const requestedTitle = _.lowerCase(req.params.postName);

  Blog.find({}).then(function(blogs){
    blogs.forEach(function(post){
      const storedTitle = _.lowerCase(post.title);
  
      if (storedTitle === requestedTitle) {
        res.render("post", {
          title: post.title,
          content: post.content
        });
      }
    });
  })

});

/////////////////////////////////registration////////////////////////////////////////

app.get('/register', (req, res)=>{
  res.render('register.ejs')
})

app.post("/register", function(req, res){

  // const newRegister=new Register({
    
  //   username:req.body.username,
  //   email:req.body.email,
  //   password:req.body.password,
    
  // })

  // newRegister.save()
  // res.redirect('/main')

  Register.register({username:req.body.username}, req.body.password, function(err, user) {
    if (err)
    {
        console.log(err)
        res.redirect('/register')
    }
  
    else{
        passport.authenticate('local')(req, res, function(){
            res.redirect('/main')
        })
    }

  })

})

app.get('/login', (req, res)=>{
  res.render('login.ejs')
})


// app.use(flash());
// app.use(function (req, res, next) {
// res.locals.messages = require('express-messages')(req, res);
// next()
// });

app.post('/login', (req, res)=>{
  // const email=req.body.email
  // const password=req.body.password
  // let userFound = false;
  // Register.find({}).then(function(registers){
  //   registers.forEach(function(register){
  //     if(email===register.email)
  //     {
  //       if(password===register.password)
  //       {
  //         // req.flash('succes', 'You are logged in')
  //         userFound = true
  //         res.redirect('/main')
  //       }
  //       else
  //       {
  //         // req.flash('Wrong password')
  //         res.redirect('/login')
  //       }
  //     }
  //   })
  //   if(!userFound)
  //   res.redirect('/register')
  // }).catch(function(err){
  //   console.log(err)
  // })

  const user = new Register({
    username:req.body.username,
    password:req.body.password
})
req.login(user, function(err){
    if(err)
    {
        console.log(err)
    }
    else{
        passport.authenticate('local')(req, res, function(){
            res.redirect('/main')
        })
    }
})

})

app.get('/logout', (req, res)=>{
  req.logout(function(err){
      if(err)
      {
          console.log(err)
      }
      else{
          res.redirect('/')
      }
  })
  
})


