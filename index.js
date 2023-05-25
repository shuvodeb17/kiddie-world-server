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
        // await client.connect();
        client.connect();

        const addToy = client.db('kiddieWorld').collection('addToy')


        /* const indexKeys = { title: 1, category: 1 }
        const indexOptions = { name: "titleCategory" }
        const result = await allToys.createIndex(indexKeys, indexOptions) */

        app.get('/search-toys/:text', async (req, res) => {
            const searchText = req.params.text;
            console.log(searchText)
            const result = await addToy.find({
                $or: [
                    { toyName: { $regex: searchText, $options: "i" } },
                    { subCategory: { $regex: searchText, $options: "i" } }
                ],
            }).toArray()
            res.send(result)
        })


        app.get('/all-toys/:category', async (req, res) => {
            if (req.params.category == 'Sports Car' || req.params.category == 'Tractor' || req.params.category == 'Fire') {
                const cursor = addToy.find({ subCategory: req.params.category })
                const result = await cursor.toArray()
                res.send(result)
            }
            else if (req.params.category == 'all') {
                const cursor = addToy.find({})
                const result = await cursor.toArray()
                res.send(result)
            }
        })

        app.get('/all-toys', async (req, res) => {
            const cursor = addToy.find({})
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/toy/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await addToy.findOne(query)
            res.send(result)
        })


        app.post('/all-toys-insert', async (req, res) => {
            const data = req.body;
            const result = await addToy.insertOne(data)
            res.send(result)
        })


        // specific user
        app.get('/added-toys', async (req, res) => {
            // console.log(req.query?.email)
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


        // update
        app.patch('/update/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    ...data
                }
            }
            const result = await addToy.updateOne(filter, updatedDoc, options)
            res.send(result)
        })

        // delete
        app.delete('/toyRemove/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await addToy.deleteOne(query)
            res.send(result)
        })

        // single toy 
        app.get('/toySingle/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await addToy.findOne(query)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("database connected");
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
