const express = require('express');
const cors = require('cors');
// const bodyParser = require('body-parser');
// // const fileUpload = require('express-fileupload');
const signRoutes = require('./routes/userRoutes');
const admin=require('./routes/admin');
const buyProduct=require('./routes/buyProduct');
const update=require('./routes/update')
const app = express();

app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(fileUpload());
// app.use(express.static('public')); 
app.use(express.json()); 

const db = require('./Database/db'); 

app.use('/api', signRoutes,admin,buyProduct);
// app.use('/api',bookingRoutes);

app.listen(3003, () => {
    console.log('Server is running on port 3003');
});
 
// // Error handling middleware
// app.use((err, req, res, next) => {
//     console.error(err.stack); // Log the error for debugging
//     res.status(500).json({ status: 'error', message: 'An error occurred.' });
//   });
  
