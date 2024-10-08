const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());
const connectionString = "mongodb://localhost:27017/pepe";
mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

const Item = mongoose.model('Item', new mongoose.Schema({
    wallet_id: {type: String, required: true},
    value: { type: Number, required: true },
    description: String,
}));



app.post('/addItem', async (req, res) => {
    
    const item = new Item(req.body);
    try {
        const savedItem = await item.save();
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/getSumItems/:id', async (req, res) => {
    const wallet_id = req.params.id;
    try {
      
        let sum = 0;
        const result = await Item.where('wallet_id').equals(wallet_id)
        for (let i = 0; i < result.length; i++) {
            sum += Number(result[i].value);
        }

        res.json({ total: sum });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});

app.get('/getSort', async (req, res) => {
    
    try {
        const result = await Item.aggregate([
            {
                $group: {
                    _id: '$wallet_id',
                    totalValue: { $sum: '$value' }
                }
            }
        ]);
        
        result.sort((a, b) => b.totalValue - a.totalValue);
        console.log("&&&&&&& result &&&&&&&", result);
        res.json({result});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
