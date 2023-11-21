const express = require("express");
const cors = require('cors');
require('dotenv').config()
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)
// const { MongoClient, ServerApiVersion } = require('mongodb');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json())
 




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zjeuj.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const mensCollection = client.db('allShopping').collection('mens')
    const kidsCollection = client.db('allShopping').collection('kids')
    const womensCollection = client.db('allShopping').collection('womens')
    const cartCollection = client.db('allShopping').collection('carts')
    const paymentsCollection = client.db('allShopping').collection('payments')
    const booksCollection = client.db('booksProduct').collection('books')
  

    // men 
   app.get('/mens', async (req, res)=> {
    const result = await mensCollection.find().toArray()
    res.send(result)
   })



    // kids
   app.get('/kids', async (req, res)=> {
    const result = await kidsCollection.find().toArray()
    res.send(result)
   })
    
   // women

   app.get('/womens', async (req, res)=> {
    const result = await womensCollection.find().toArray()
    res.send(result)
   })

    // cart collection
    app.post('/carts', async (req, res) => {
      const item = req.body;
      const result = await cartCollection.insertOne(item)
      res.send(result)
    })
    // cart collection apis
    app.get('/carts', async(req,res)=> {
      const email = req.query.email
      if(!email){
        res.send([])

      }
      const query = {email:email}
      const result = await cartCollection.find(query).toArray()
      res.send(result)
    })
// delete carts
app.delete('/carts/:id', async(req, res)=> {
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await cartCollection.deleteOne(query)
  res.send(result)
})

// create payment intent//

app.post('/create-payment-intent', async (req, res) => {
  const { price } = req.body;
  const amount = parseInt(price * 100);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'usd',
    payment_method_types: ['card']
  });

  res.send({
    clientSecret: paymentIntent.client_secret
  })
})


//payment related api//

app.post('/payments', async(req,res) => {
  const payment = req.body
  const insertResult = await paymentsCollection.insertOne(payment)


  const query = {_id: payment.cartItems.map(id => new ObjectId(id))}
  const deleteResult = await cartCollection.deleteMany(query)

  res.send({insertResult, deleteResult})

})
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
  }
}
run().catch(console.dir);

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kql3ua3.mongodb.net/?retryWrites=true&w=majority`;

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
   
//     await client.connect();

//    const eCollection = client.db('ecommerce').collection('men')

//    app.get('/men', (req, res)=> {
//     const result = eCollection.find().toArray()
//     res.send(result)
//    })

//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
   
   
//   }
// }
// run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('eshopping is running')


})


app.listen(port, () => {
   console.log(`eshopping server is running on port ${port}`)
})