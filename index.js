const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser')
const firebase = require("firebase/app");
const bodyParser = require('body-parser');
const auth = require("firebase/auth");
require("firebase/firestore");
// console.log(auth)
const authTokens =[]
const firebaseConfig = {
   apiKey: "AIzaSyAwDMpaSqJLF2CrGDuLZVJf4T9S9ZWeuJA",
   authDomain: "awesome-23720.firebaseapp.com",
   projectId: "awesome-23720",
   storageBucket: "awesome-23720.appspot.com",
   messagingSenderId: "644683392435",
   appId: "1:644683392435:web:bcc1f8b62dd0e9a62c57c6",
   measurementId: "G-X2K0DHSR2H"
 };

const now = new Date();
const millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59) - now;
if (millisTill10 < 0) {
     millisTill10 += 86400000; // it's after 10am, try 10am tomorrow.
}
console.log(millisTill10)
setInterval(function(){authTokens.length = 0}, millisTill10);

firebase.initializeApp(firebaseConfig);
// const auth = firebase.auth();
const getCookie = (name,cookies)=> {
   var cookieArr = cookies.split(";");
   for(var i = 0; i < cookieArr.length; i++) {
       var cookiePair = cookieArr[i].split("=");
       if(name == cookiePair[0].trim()) {
           console.log(decodeURIComponent(cookiePair[1]))
           return decodeURIComponent(cookiePair[1]);
       }
   } 
   return null;
}

const cookieHandler = (status,token)=>{
   if(status == "get"){
      return authTokens[authTokens.length-1]
   }
   else{
      authTokens.push(token);
   }
}
const signIn = (req, res, next)=>{
   let data = req.body;
   console.log(data)
   let email = data.email;
   let password = data.password;
   auth.signInWithEmailAndPassword(auth.getAuth(),email, password)
  .then((userCredential) => {
    // Signed in
    let user = userCredential.user;
    // ...
    let token = user.stsTokenManager.accessToken
   //  console.log(user.stsTokenManager.accessToken)
    cookieHandler("put",token)
    console.log(authTokens)
   //  res.json({'authToken':token});
    next()
   })
  .catch((error) => {
    console.log(error.message)
    var errorCode = error.code;
    var errorMessage = error.message;
    res.status(403).json(errorMessage);
  });
}

const isLoggedIn = (req, res, next) => {
   let authToken = req.cookies['authToken'];
   console.log('authToken is',authToken)
   if(authToken == null || authToken == undefined) {
      console.log('No auth token')
       res.sendFile(path.join(__dirname,'login', 'index.html'))
   } else {
      if(authTokens.includes(authToken)) {
         console.log('true')
         res.sendFile(path.join(__dirname,'build', 'index.html'))
         next()
      }
     // return unauthorized
     else{
      console.log('unauthorized')
      res.sendFile(path.join(__dirname,'login', 'index.html'))     
      }
   }
 };
app.use(cookieParser());
app.use(bodyParser.json());


app.use('/verify',signIn, function (req, res) {
   res.set('Set-Cookie',`authToken=${cookieHandler("get")};Expires=${new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59).toUTCString()}Path=/`)
   res.status(200)
   res.redirect('/manage')
   })
app.get('/',function(req, res){
      res.redirect('/manage')
   });
app.use(express.static(path.join(__dirname,'login')));
app.use(express.static(path.join(__dirname,'build'),{
   setHeaders: function (res, path, stat) {
     res.set('Set-Cookie',`authToken=${cookieHandler("get")};Expires=${new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59).toUTCString()}Path=/`)
   }}))



app.get('/manage',isLoggedIn,function(req, res){
   res.sendFile(path.join(__dirname,'build', 'index.html'))
});

app.listen(process.env.PORT || 8081)
module.exports = app
