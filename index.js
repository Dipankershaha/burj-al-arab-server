const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const serviceAccount = require("./configs/burj-al-arab-678e2-firebase-adminsdk-5tzxm-7bc3b8b11e.json");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aljcb.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const app = express();

app.use(cors());
app.use(bodyParser.json());





admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB,
});


app.get('/', (req, res) => {
    res.send("hello world");
})



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");
  // perform actions on the collection object
  app.post('/addBooking', (req, res) => {
      const newBooking = req.body;
      bookings.insertOne(newBooking)
      .then(result =>{
          res.send(result.insertedCount > 0);
      })
      console.log(newBooking);
  })
  app.get('/bookings', (req, res)=>{
    const bearer = req.headers.authorization;
    if(bearer && bearer.startsWith('Bearer ')){
        const idToken = bearer.split(' ')[1];
        // console.log({idToken});
        admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
            // const uid = decodedToken.uid;
            const tokenEmail = decodedToken.email;
            const queryEmail =  req.query.email;
            if( tokenEmail == queryEmail){
                bookings.find({email:req.query.email})
                .toArray((err, documents)=>{
                    res.status(200).send(documents)
                })
            }
            else{
                res.status(401).send('Unauthorized Access');
            }
            // ...
        })
        .catch((error) => {
        // Handle error
        res.status(401).send('Unauthorized Access');
        });
    }
    else{
        res.status(401).send('Unauthorized Access');
    }

   
    
      
  })
  console.log("db connected successfully");
//   client.close();
});






app.listen(5000);