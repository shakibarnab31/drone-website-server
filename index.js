const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const app = express()
const port = process.env.PORT || 5000;


// middle wire 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dampa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('dronaDB');
        const productsCollection = database.collection('products');
        const orderedCollection = database.collection('orderedProducts');
        const usersCollection = database.collection('users')
        const reviewCollection = database.collection('reviews')

        // get api
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        })

        // get single product api
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const singleProduct = await productsCollection.findOne(query);
            res.json(singleProduct);
        })

        // get my order
        app.get('/orderedProducts', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = orderedCollection.find(query);
            const myOrders = await cursor.toArray();
            res.json(myOrders)
        })

        // get all order
        app.get('/allorders', async (req, res) => {

            const result = await orderedCollection.find({}).toArray();
            res.json(result)

        })

        // get api for reviews
        app.get('/reviews', async (req, res) => {

            const result = await reviewCollection.find({}).toArray();
            res.json(result)

        })

        // checking admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

        // post api
        app.post('/orderedProduct', async (req, res) => {
            const orderedProduct = req.body;
            const result = await orderedCollection.insertOne(orderedProduct);
            res.json(result)
        })

        // post api for add product
        app.post('/addProduct', async (req, res) => {
            const addedProduct = req.body;
            const result = await productsCollection.insertOne(addedProduct);
            res.json(result);
        })

        // Post api for add review

        app.post('/addReview', async (req, res) => {
            const addedReview = req.body;
            const result = await reviewCollection.insertOne(addedReview);
            res.json(result);
        })

        // save user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result)
        })

        // make admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            console.log(result)
            res.json(result);
        })
        // delete api for my orders
        app.delete('/deleteMyOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderedCollection.deleteOne(query)
            res.send(result);
        })
        // delete api for  orders
        app.delete('/deleteOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderedCollection.deleteOne(query)
            res.send(result);
        })
        // delete api for products
        app.delete('/deleteProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query)
            res.send(result);
        })
        // status update
        app.put('/statusUpdate/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await orderedCollection.updateOne(filter, {
                $set: {
                    status: req.body.status
                }
            })
            res.json(result)
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Hello from drona drone')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})