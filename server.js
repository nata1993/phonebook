//"C:\Program Files\MongoDB\Server\4.4\bin\mongod.exe" --dbpath="c:\data\db"

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
const port = 3000;
const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost:27017/phoneContactsDB',
{useNewUrlParser: true, useUnifiedTopology: true});

// schema for adding phone carrier and number
const phoneNumberSchema = new mongoose.Schema({
    carrier: String,
    phone: String
});

const Contact = new mongoose.model('PhoneContact', phoneNumberSchema);

//basic navigation
app.get('/', (req, res)=>{
    res.render('home');
});
app.post('/addContact', (req, res)=>{
    res.render('addContactPage');
});

//basic operations
app.post('/addPhoneNumber', (req, res)=>{
    //encode in base64
    const carr = req.body.phoneNumberCarrier;
    const buff = Buffer.from(carr, 'utf-8');
    const base64Carr = buff.toString('base64');

    const num = req.body.phoneNumber;
    const buff2 = Buffer.from(num, 'utf-8');
    const base64Num = buff2.toString('base64');
    // interract with database
    const newContact = new Contact({
        carrier: base64Carr,
        phone: base64Num
    });

    newContact.save((error) => {
        if(error){
            console.log(error);
        }
        else{
            res.render('feedback');
        }
    });
});

app.post('/contacts', (req, res)=>{
    Contact.find((err, databaseData) => {
        if (err)
            console.log(err);
        else{
            var formatedData = [];

            //decode base64
            for(var i = 0; i < databaseData.length; i++){
                var base64 = databaseData[i].carrier;
                var buff = Buffer.from(base64, 'base64');
                const carr = buff.toString('utf-8');

                base64 = databaseData[i].phone;
                buff = Buffer.from(base64, 'base64');
                const num = buff.toString('utf-8');
                formatedData.push({carrier: carr, phone: num});
            }

            res.render('showContacts', {formatedData});
        }
    });
});

app.listen(port, () => {
    console.log(`app running on port ${port}`);
});