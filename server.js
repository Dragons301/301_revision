'use strict';
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//App Related
const express = require('express');
const cors = require('cors');
//APIs Related
const superagent = require('superagent');
//DB Related
const pg = require('pg');
//dotenv Related
require('dotenv').config(); //must be before the process.env..... + the parantheses is very very important after config.
const PORT = process.env.PORT;
let DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);
//Method Over-ride
let methodOverride = require('method-override');
//app - must be after the requires
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
//Rendering Related
app.set('view engine', 'ejs');
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Getting data from API
// /home end point
app.get('/home', handleHome);
function handleHome(req, res) {
    let dataArr = [];
    let url = 'https://cat-fact.herokuapp.com/facts';
    superagent.get(url).then(data => {
        // console.log(data.body);
        data.body.all.forEach(element => {
            //always when we take data from API we say .body, because it loaded in the body
            //all is the array of objects, we take it from the API result
            dataArr.push(new Fact(element));
        });
        //display the data
        //res.send('hello test');
        // res.render(dataArr);
        //render the data
        res.render('home-page', { result: dataArr }); //result is just name, like key for the dataArr
        console.log('rendering home page');
    }).catch(error => {
        console.log('Sorry .. an error occured while getting data from API ', error);
        response.send('error');
    });
}
//constructor
function Fact(data) {
    this.type = data.type;
    this.text = data.text;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Add to DB
app.post('/facts', handleAddFact);
function handleAddFact(req, res) {
    // res.send(req.body);
    let query = 'INSERT INTO fact(type,text) VALUES($1,$2);';
    let values = [req.body.type, req.body.text]; //we get the values form the form
    client.query(query, values).then(() => {
        //res.send('added to DB);
        res.redirect('/facts'); //print the results on another page
    }).catch((error) => {
        console.log('error happend in handleAddFact...',error);
      });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Retrieve from DB
app.get('/facts', handleGettingFavFacts);
function handleGettingFavFacts(req, res) {
    let query = 'SELECT * FROM fact;';
    client.query(query).then(data => {
        // res.send(data);
        res.render('fav-facts', { result: data.rows });
    }).catch((error) => {
        console.log('error happend in handleGettingFavFacts...',error);
      });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//View details for each type
app.get('/facts/:id', handleFactDetails);
function handleFactDetails(req, res) {
    let query = 'SELECT * FROM fact WHERE id = $1;';
    let values = [req.params.id];
    client.query(query,values).then(data => {
        res.render('fact-details', { result: data.rows[0]});
    }).catch((error) => {
        console.log('error happend in handleFactDetails...',error);
      });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Updating the details
app.put('/facts/:id', handleUpdateFact);
function handleUpdateFact(req,res){
    let query = 'UPDATE fact SET type = $1, text = $2 WHERE id = $3;';
    let values = [req.body.type,req.body.text,req.params.id];
    client.query(query,values).then(() => {
        res.redirect('/facts');
    }).catch((error) => {
        console.log('error happend in handleUpdateFact...',error);
      });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Delete the fact
app.delete('/facts/:id', handleDeleteFact);
function handleDeleteFact(req,res){
    let query = 'DELETE FROM fact WHERE id = $1;';
    let values = [req.params.id]; //id is the var name, in the end point
    client.query(query,values).then(() => {
        res.redirect('/facts'); //redirect tohome page
    }).catch((error) => {
        console.log('error happend in handleDeleteFact...',error);
      });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Connecting
client.connect().then(() => {
    app.listen(PORT, () => {
        console.log(`app is listening on port ${PORT}`);
    });
}).catch(error => {
    console.log('an error happened while connect to DB', error);
});



























































// 'use strict';

// //require

// const express = require('express');
// const cors = require('cors');
// const superagent = require('superagent');
// const pg = require('pg');
// const methodOverride = require('method-override');
// require('dotenv').config();



// //app

// const app = express();
// app.use(cors());
// app.use(express.static('public'));
// app.set('view engine', 'ejs');
// app.use(express.urlencoded({extended: true}));
// app.use(methodOverride('_method'));
// const PORT = process.env.PORT;
// const DATABASE_URL = process.env.DATABASE_URL;
// const client = new pg.Client(DATABASE_URL);



// //routs

// app.get('/home', homePage);
// app.get('/fact', showFavorite);
// app.post('/facts', favFacts);
// app.get('/facts/:id', handleFactDetails);
// app.put('/facts/:id', handleUpdateingFact);
// app.delete('/delete/:id', deleteFact);
// app.get('*', (request, response) => response.status(404).send('This route does not exist'));



// //functions

// function homePage(request, response){
//     let dataArr = [];
//     let url = 'https://cat-fact.herokuapp.com/facts';
//     superagent.get(url).then(data=>{
//         data.body.all.forEach(element => {
//             dataArr.push(new Facts(element));
//         });
//         response.render('home-page', {result: dataArr});
//     }).catch(handlerError);
// }


// function favFacts(request,response){
//     let query = 'INSERT INTO fact(type,text) VALUES ($1,$2)';
//     let values = [request.body.type, request.body.text];
//     client.query(query,values).then(()=>{
//         response.redirect('/fact');
//     }).catch(handlerError);
// }


// function showFavorite(request,response){
//     let query = 'SELECT * FROM fact;';
//     client.query(query).then(data=>{
//         response.render('fav-facts', {result:data.rows});
//     }).catch(handlerError);
// }


// function deleteFact(request,response){
//     let factId = [request.params.id];
//     let deleteRow = 'DELETE FROM fact WHERE id=$1';
//     client.query(deleteRow, factId).then(()=>{
//         response.redirect('/fact');
//     });
// }

// function handleFactDetails(request,response){
//     let query = 'SELECT * FROM fact WHERE id = $1;';
//     let values = [request.params.id];
//     client.query(query, values).then(data=>{
//         response.render('fact-details', {result: data.rows[0]});
//     })
// }

// function handleUpdateingFact(request,response){
//     let query = 'UPDATE fact SET type = $1, text= $2 WHERE id=$3;'
//     let values = [request.body.type, request.body.text, request.params.id];
//     client.query(query,values).then(()=>{
//         response.redirect('/home');
//     })
// }

// function Facts(data){
//     this.text = data.text;
//     this.type = data.type;
// }

// client.connect().then(()=>{
//     app.listen(PORT, ()=>console.log(`listening on ${PORT}`));
// });

// //helper function 

// function handlerError(request, response){
//     response.status(500).send('opps');
// }












































































// const express = require('express');
// const pg = require('pg');
// const cors = require('cors');
// const superagent = require('superagent');


// require('dotenv').config();


// const app = express();
// const PORT = process.env.PORT;
// const DATABASE_URL = process.env.DATABASE_URL;

// app.use(cors());
// app.use(express.urlencoded({extended: true}));
// app.set('view engine', 'ejs')

// const client = new pg.Client(DATABASE_URL);


// app.get('/home', handleHome);
// app.get('/fact', handleGettingFavFacts);
// app.post('/facts', handleAddFact)


// function handleHome(request, response){
//     let dataArr = [];
//     let url = 'https://cat-fact.herokuapp.com/facts';
//     superagent.get(url).then(data =>{
//         // console.log(data);
//         data.body.all.forEach(element => {
//            dataArr.push(new Fact(element));
//         });
//         response.render('home-page', {result:dataArr});
//     });
// }


// function handleGettingFavFacts(request, response){
//     let query = 'SELECT * FROM fact;';
//     client.query(query).then(data =>{
//         response.render('fav-facts', {result: data.rows});
        
//     })
// }

// function handleAddFact (request,response){
   
//     let query = 'INSERT INTO fact (type,text) VALUES ($1,$2)';
//     let values = [request.body.type, request.body.text];
//     client.query(query,values).then(()=>{
//         response.redirect('/fact');
//     })
// }
// function Fact(data){
//     this.type = data.type;
//     this.text = data.text;
// }

// client.connect().then(()=>{
//     app.listen(PORT, ()=>console.log(`App is listening to port${PORT}`));
// })