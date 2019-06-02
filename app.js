const express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport')
const bcrypt = require('bcryptjs');
const session = require('express-session');
const PORT = process.env.PORT || 3000

// Database connection
mongoose.connect('mongodb://localhost/asc',{ useNewUrlParser: true });
mongoose.set('useCreateIndex', true);
mongoose.Promise = global.Promise;
let db = mongoose.connection;

// Check database connection
db.once('open', function(){
    console.log('Connection to MongoDB established successfully');
});

//check for db errors
db.on('error',function(err){
    console.log(err);
});

// bring in user model
let User = require('./models/user');
let Case = require('./models/case');

// Init App
const app = express();

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//Express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }));


// Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Express Flash Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
 
// parse application/json
app.use(bodyParser.json());

// Cookie Parser
app.use(require('cookie-parser')());

// Load View Engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

//Set public folder
app.use(express.static(path.join(__dirname,'public')));

//Login route
app.get('/',(req,res)=>{
    res.render('login',{
    	title: 'Login'
    });
});

//Register route
app.get('/Register',(req,res)=>{
    res.render('register',{
    	title: 'Register User'
    });
});

//Security_service route
app.get('/private_security',(req,res)=>{
	Case.find({},(err,data)=>{
		if(err) throw err
		User.findById(req.query._id,(err,user)=>{
			if(err) throw err
				Case.find({case_class:'major'},(err,data2)=>{
					if(err) throw err
					res.render('private_security',{
				    	title: 'Private Security',
				    	name: user.name,
				    	case_data:data,
				    	case_data2:data2
				    });
				});
		});
	});
    
});

//Police Service route
app.get('/police_service',async(req,res)=>{
	const user = await User.findById(req.query._id)
	const major_case_data = await Case.find({case_class:'major'})

    res.render('police_service',{
    	title: 'Police Service',
    	name: user.name,
    	major_case_data:major_case_data
    });
});

// Case view route
app.get('/case_view/:id',async(req,res)=>{
	const case_view = await Case.findById(req.params.id)
	console.log(case_view)
	res.render('case_view',{
		title: 'Case View',
		case_view:case_view
	})
})

// Case update route
app.get('/case_update/:id',async(req,res)=>{
	const case_view = await Case.findById(req.params.id)
	console.log(case_view)
	res.render('case_update',{
		title: 'Case Update',
		case_view:case_view
	})
})

// Case update action
app.post('/case_update/:id',async(req,res)=>{

const investigation = await Case.update({_id:req.params.id},{investigation:req.body.investigation})
res.redirect('back')
});

// Judiciaty Route
app.get('/judiciary',async(req,res)=>{
	const user = await User.findById(req.query._id)
	const major_case_data = await Case.find({case_class:'major'})

    res.render('judiciary',{
    	title: 'Judiciary Service',
    	name: user.name,
    	major_case_data:major_case_data
    });
});

// Register user
app.post('/register',(req,res)=>{

    const email = req.body.email;
    const name = req.body.name;
    const agency = req.body.agency;
    const password = req.body.password;


let newUser = new User({
    name:name,
    email:email,
    password:password,
    agency:agency
});

bcrypt.genSalt(10,function(err,salt){
    if(err) throw err
    bcrypt.hash(newUser.password,salt, function(err,hash){
        if(err) throw err
        newUser.password = hash;
        newUser.save(function(err){
            if(err){
                console.log(err);
                return;
            }else{
                req.flash('success','User added successfully')
                res.redirect('/');
            }
        });
    });
});
});

// Login Process
app.post('/login',
    passport.authenticate('local',{failureFlash:true,failureRedirect:"/"}),
    function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    User.findById(req.user._id,(err,user)=>{
        if (err) throw err
        if(user.agency == 'police_service'){
            res.redirect('/police_service/?_id=' + req.user._id);
        }else if(user.agency == 'private_security'){
        	res.redirect('/private_security/?_id=' + req.user._id);
        }else{
        	res.redirect('/judiciary/?_id=' + req.user._id);
        }
    });  
});

// Submit Case
app.post('/case',(req,res)=>{

    const accuser = req.body.accuser;
    const contact = req.body.contact;
    const statement = req.body.statement;
    const case_class = req.body.case_class;

let newCase = new Case({
    accuser:accuser,
    contact:contact,
    statement:statement,
    case_class:case_class
});

newCase.save(function(err){
    if(err){
        console.log(err);
        return;
    }else{
        res.redirect('back');
    }
});
});

// sign out
app.get('/signout',function(req,res){
    req.logout();
    res.redirect('/');
})

// Start Server
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));