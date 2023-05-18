const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
require('dotenv').config()
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b0yctrm.mongodb.net/?retryWrites=true&w=majority`;

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

        const allToys = client.db('kiddieWorld').collection('allToys')
        const addToy = client.db('kiddieWorld').collection('addToy')

        app.get('/all-toys/:category', async (req, res) => {
            if (req.params.category == 'Sports Car' || req.params.category == 'Tractor' || req.params.category == 'Fire') {
                const cursor = allToys.find({ subCategory: req.params.category })
                const result = await cursor.toArray()
                res.send(result)
            }
            else if (req.params.category == 'all') {
                const cursor = allToys.find({})
                const result = await cursor.toArray()
                res.send(result)
            }
        })

        app.get('/all-toys', async (req, res) => {
            const cursor = allToys.find({})
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/toy/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await allToys.findOne(query);
            res.send(result)
        })


        app.post('/all-toys-insert', async (req, res) => {
            const data = req.body;
            const result = await allToys.insertOne(data)
            res.send(result)
        })


        // specific user
        app.get('/added-toys', async (req, res) => {
            console.log(req.query?.email)
            let query = {};
            if (req.query?.email) {
                query = { email: req.query?.email }
            }
            const result = await addToy.find(query).toArray()
            res.send(result)
        })

        app.post('/added-toys', async (req, res) => {
            const added = req.body;
            const result = await addToy.insertOne(added)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
