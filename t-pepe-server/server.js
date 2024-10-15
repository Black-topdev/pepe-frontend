const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const bodyParser = require('body-parser');
const bs58 = require('bs58');

require('dotenv').config();
const app = express();
const PORT = 3001;

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
    wallet_id: { type: String, required: true },
    value: { type: Number, required: true },
    description: String,
}));

const { Connection, Keypair, PublicKey, Transaction } = require('@solana/web3.js');
const { Token, TOKEN_PROGRAM_ID } = require('@solana/spl-token');

const connection = new Connection(process.env.SOLANA_CLUSTER, 'confirmed');

const payer = Keypair.fromSecretKey(bs58.decode(process.env.SOLANA_PRIVATE_KEY));

const tokenMintAddress = new PublicKey(process.env.TOKEN_MINT_ADDRESS);

app.post('/claimReward/:walletId', async (req, res) => {
    const userWallet = new PublicKey(req.params.walletId);

    try {
        let totalScore = 0;
        const items = await Item.where('wallet_id').equals(req.params.walletId);
        for (const item of items) {
            totalScore += item.value;
        }

        const tokenDecimals = 6; // Adjust based on token's precision
        const tokenAmount = totalScore / 1000;
        if (tokenAmount <= 0) {
            return res.status(400).json({ message: "Insufficient score to claim rewards." });
        }

        const token = new Token(connection, tokenMintAddress, TOKEN_PROGRAM_ID, payer);

        const fromTokenAccount = await token.getOrCreateAssociatedAccountInfo(payer.publicKey);
        const toTokenAccount = await token.getOrCreateAssociatedAccountInfo(userWallet);

        const transaction = new Transaction().add(
            Token.createTransferInstruction(
                TOKEN_PROGRAM_ID,
                fromTokenAccount.address,
                toTokenAccount.address,
                payer.publicKey,
                [],
                tokenAmount * Math.pow(10, tokenDecimals)
            )
        );

        const signature = await connection.sendTransaction(transaction, [payer]);
        await connection.confirmTransaction(signature, 'confirmed');

        res.status(200).json({ message: "Reward claimed successfully!", signature });
    } catch (error) {
        console.error("Error claiming reward:", error);
        res.status(500).json({ message: "Failed to claim reward. Please try again later." });
    }
});

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
        const result = await Item.where('wallet_id').equals(wallet_id);
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
        res.json({ result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
