const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

// middlewear
app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.send('Toggy server is running');
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jcgcmli.mongodb.net/?retryWrites=true&w=majority`;

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

    const toyCollection = client.db('coffeeDB').collection('toys');
    const categorieCollection = client.db('coffeeDB').collection('categories');

    app.get('/toys',async(req,res)=>{
        const cursor = toyCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/singleToy/:id',async(req,res)=>{
      const id = req.params.id;
      const result = await toyCollection.findOne({_id:new ObjectId(id)})
      res.send(result);
    })

    app.get('/myToys/:email',async(req,res)=>{
      const result = await toyCollection.find({
        seller_email:req.params.email
      }).toArray();
      res.send(result)
    })

    app.get('/allToys/:category',async(req,res)=>{
      const category = req.params.category;
      const toys = await toyCollection.find({
        sub_Category:category
      }).toArray();
      console.log(toys)
      res.send(toys)

    })

    app.get("/categories", async (req, res) => {
      const result = await categorieCollection.find().toArray();
      res.send(result);
    });

    
    
    app.post('/addToys',async(req,res)=>{
      const body = req.body;
      const result = await toyCollection.insertOne(body);
      res.send(body)
    })

    app.put('/update/:id',async(req,res)=>{
      const body = req.body;
      console.log(body)
      const id = req.params.id;
      const filter = {_id:new ObjectId(id)};
      const updateDoc ={
        $set:{
          subCategory:body.subCategory,
          toyName:body.toyName,
          quantity:body.quantity,
          price:body.price
        }
      }
      const result = await toyCollection.updateOne(filter,updateDoc)
      console.log(result)
      res.send(result)
    })

   

    app.get("/categories/:id", async (req, res) => {
      const toys = await toyCollection.find().toArray();
      const id = parseInt(req.params.id);
      console.log(id);
      if (id === 0) {
        res.send(toys);
      } else {
        const categoryToys = toys.filter(
          (sub) => parseInt(sub.category_id) === id
        );
        res.send(categoryToys);
      }
    });


    app.get("/toySearch/:text", async (req, res) => {
 

      const text = req.params.text;
      const result = await toyCollection
        .find({
          $or: [
            { toy_name: { $regex: text, $options: "i" } },
            { sub_category: { $regex: text, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });


  

    app.delete('/toys/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id:new ObjectId(id)};
      const result = await toyCollection.deleteOne(query);
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


app.listen(port,()=>{
    console.log(`Toggy server is running:${port}`)
})