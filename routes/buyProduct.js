const express = require("express");
const app = express.Router();
const db = require("../Database/db");

app.post('/createProduct/:user_id', (req, res) => {
    const user_Id = req.params.user_id;
    const {mobile_name, mobile_model, mobile_price, offer_price } = req.body;
    const sql = `INSERT INTO mas_product (user_id,mobile_name, mobile_model, mobile_price, offer_price) VALUES (?, ?, ?, ?, ?)`;
    const values = [user_Id, mobile_name, mobile_model, mobile_price, offer_price];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting into mas_product:', err);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('Product added successfully');
            // Send a JSON response with the inserted data and user ID
            res.status(201).json({ message: 'Product added successfully', result, user_Id });
        }
    }); 
});

module.exports=app;