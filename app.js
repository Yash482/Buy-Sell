const path = require('path');
//=========================================
//=====taking inputs======================


const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const errorController = require('./controllers/error');
const User = require('./models/user');

//=========================================================================

const MONGODB_URI = 'mongodb://localhost/shop';
mongoose.connect("mongodb://localhost/shop", {useNewUrlParser: true, useUnifiedTopology: true});

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

//taking care of uploads=========================================

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) =>{
      cb(null, './public/uploads')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname+"_"+Date.now()+file.originalname);
    }
  });
  
//=================================================================
  
app.use(bodyParser.urlencoded({extended : true}));
app.use(multer({storage: fileStorage}).single('image'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'I am the best',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  //console.log(error);
  res.render('500', {pageTitle: "Error Occured", path: '/error', isAuthenticated : req.session.isLoggedIn, csrfToken : req.csrfToken()})
})

app.listen(3000);



  
