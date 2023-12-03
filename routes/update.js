const express = require("express");
const app = express.Router();
const db = require("../Database/db");
const multer = require('multer');
const path = require('path');


app.put('/updateUser/:user_id', (req, res) => {
    const userId = req.params.user_id;
    const {
        user_name,
        email,
        create_password,
        verify_password,
        referal_frd_number,
        referal_friend_total,
        referal_link,
        profile_image,
        mobile_name,
        mobile_model,
        mobile_price,
        offer_price
    } = req.body;
  
    // Update user query
    const updateUserQuery = `
        UPDATE mas_user
        SET user_name = ?, email = ?, create_password = ?, verify_password = ?,
            referal_frd_number = ?, referal_friend_total = ?, referal_link = ?, profile_image = ?
        WHERE user_id = ?
    `;
  
    const userValues = [
        user_name,
        email,
        create_password,
        verify_password,
        referal_frd_number,
        referal_friend_total,
        referal_link,
        profile_image,
        userId
    ];
  
    // Update product query
    const updateProductQuery = `
        UPDATE mas_product
        SET mobile_name = ?, mobile_model = ?, mobile_price = ?, offer_price = ?
        WHERE user_id = ?
    `;
  
    const productValues = [mobile_name, mobile_model, mobile_price, offer_price, userId];
  
    // Perform both update queries in a transaction
    db.beginTransaction((transactionErr) => {
        if (transactionErr) {
            console.error('Error beginning transaction:', transactionErr);
            res.status(500).send('Internal Server Error');
            return;
        }
  
        // Update user
        db.query(updateUserQuery, userValues, (updateUserErr, userResult) => {
            if (updateUserErr) {
                db.rollback(() => {
                    console.error('Error updating user:', updateUserErr);
                    res.status(500).send('Internal Server Error');
                });
            } else {
                // Update product
                db.query(updateProductQuery, productValues, (updateProductErr, productResult) => {
                    if (updateProductErr) {
                        db.rollback(() => {
                            console.error('Error updating product:', updateProductErr);
                            res.status(500).send('Internal Server Error');
                        });
                    } else {
                        // Commit the transaction
                        db.commit((commitErr) => {
                            if (commitErr) {
                                db.rollback(() => {
                                    console.error('Error committing transaction:', commitErr);
                                    res.status(500).send('Internal Server Error');
                                });
                            } else {
                                res.status(200).json({
                                    message: 'User and product updated successfully',
                                    userResult,
                                    productResult
                                });
                            }
                        });
                    }
                });
            }
        });
    });
  });
  const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, 'public/images');
    },
    filename: (req, file, callback) => {
      callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ storage });
  
  app.put('/upload/:user_id', upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
  
    const user_id = req.params.user_id;
    const imageUrl = `/images/${req.file.filename}`;
  
    console.log('Received PUT request for user_id:', user_id);
    
    db.query('SELECT * FROM mas_user WHERE user_id = ?', [user_id], (err, results) => {
      if (err) {
        console.error('Error checking user ID:', err);
        res.status(500).send('Error checking user ID.');
      } else if (results.length === 0) {
        res.status(404).send('User ID not found.');
      } else {
        console.log('User found:', results[0]);
  
        console.log('Updating profile image to:', imageUrl);
        
        const updateQuery = 'UPDATE mas_user SET profile_Image = ? WHERE user_id = ?';
        db.query(updateQuery, [imageUrl, user_id], (err, result) => {
          if (err) {
            console.error('Error uploading image:', err);
            res.status(500).send('Error uploading image.');
          } else {
            console.log('Image uploaded. Rows affected:', result.affectedRows);
            res.status(200).send('Image uploaded successfully.');
          }
        });
      }
    });
  });
  

  module.exports=app;