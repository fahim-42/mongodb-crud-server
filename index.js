const express = require('express');
const app = express();
const port = process.env.PORT || 3030;

require('dotenv').config();

const cors = require('cors');
app.use(cors());
app.use(express.json());

const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p55ig.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db('CRUD_Data');
        const usersCollection = database.collection('Users');

        // POST API => AddUser.js
        app.post('/users', async (req, res) => {
            // console.log('Hitting the post', req.body);

            const newUser = req.body;
            const result = await usersCollection.insertOne(newUser);
            console.log('Added user:', result);

            // res.send('hit the post');
            res.json(result);
        })

        // GET API => Users.js
        app.get('/users', async (req, res) => {
            const getUsers = usersCollection.find({});
            const users = await getUsers.toArray();
            res.send(users);
        })

        // DELETE API => Users.js : Delete Button
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('deleting user with id ', id);

            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            // console.log('Deleted user:', result);

            res.json(result);
        })

        // GET API => UpdateUser.js : Show User Details
        app.get('/users/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('Got user', id);

            const query = { _id: ObjectId(id) };
            const result = await usersCollection.findOne(query);

            // res.send('Update hitted');
            res.send(result);
        })

        // PUT API => UpdateUser.js : Update User Details
        app.put('/users/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('Update user', id);

            const updatedUser = req.body;
            const filter = { _id: ObjectId(id) };
            // update + insert == upsert
            const options = { upsert: true };

            const updateData = {
                $set: {
                    name: updatedUser.name,
                    email: updatedUser.email
                }
            };
            const result = await usersCollection.updateOne(filter, updateData, options);

            // console.log('Updating user data', req);
            res.json(result);
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Server is running');
})
app.listen(port, () => {
    console.log('Server running at:', port);
})