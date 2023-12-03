const express = require("express");
const app = express.Router();
const db = require("../Database/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function generateReferralCode(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const codeLength = length || 8;
  let referralCode = "";

  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    referralCode += characters.charAt(randomIndex);
  }

  return referralCode;
}

function generateCouponCode(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const codeLength = length || 6;
  let couponCode = "";

  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    couponCode += characters.charAt(randomIndex);
  }

  return couponCode;
}

app.post("/Create_user", (req, res) => {
  const {
    user_name,
    email,
    create_password,
    verify_password,
    referal_frd_number,
    referal_friend_total,
    referal_link,
    profile_image
  } = req.body;

  // Check if the email already exists
  const checkEmailQuery = "SELECT * FROM mas_user WHERE email = ?";

  db.query(checkEmailQuery, [email], (emailErr, emailResults) => {
    if (emailErr) {
      console.error(emailErr);
      res.status(500).send("Error checking email in the database");
      return;
    }

    // If the email already exists, send an error response
    if (emailResults.length > 0) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    // If the email is not found, proceed with the user creation
    const referalCode = generateReferralCode(7);
    // const couponCode = generateCouponCode(6);

    const insertUserQuery = `
            INSERT INTO mas_user 
            (user_name, email, create_password, verify_password, referal_code, referal_frd_number, referal_friend_total, referal_link, coupon_code, profile_image) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

    const values = [
      user_name,
      email,
      create_password,
      verify_password,
      referalCode,
      referal_frd_number,
      referal_friend_total,
      referal_link,
      profile_image
    ];

    db.query(insertUserQuery, values, (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error inserting data into the database");
      } else {
        res
          .status(201)
          .json({
            message: "User created successfully",
            userId: results.insertId,
            referalCode
          });
      }
    });
  });
});

app.post("/login", (req, res) => {
  const { email, verify_password } = req.body;

  // Check if the email exists in the database
  const checkEmailQuery = "SELECT * FROM mas_user WHERE email = ?";

  db.query(checkEmailQuery, [email], (emailErr, emailResults) => {
    if (emailErr) {
      console.error(emailErr);
      res.status(500).send("Error checking email in the database");
      return;
    }

    // If the email is not found, send an error response
    if (emailResults.length === 0) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const storedPassword = emailResults[0].verify_password;

    // Compare the provided password with the stored password
    if (verify_password === storedPassword) {
      const userId = emailResults[0].user_id;
      res.status(200).json({ message: "Login successful", userId });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  });
});

app.post("/generateReferralLink", (req, res) => {
  const { user_id } = req.body;

  // Fetch user data from the database
  const getUserQuery = "SELECT * FROM mas_user WHERE user_id = ?";

  db.query(getUserQuery, [user_id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error fetching user data");
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const referralCode = results[0].referal_code;
    const referralLink = `http://localhost:3003/api/Create_user?ref=${referralCode}`;

    // Add logic to get and return a coupon code
    const couponCode = generateCouponCode(6);

    res.status(200).json({
      referralCode,
      referralLink,
      couponCode,
    });
  });
});

app.post("/shareReferralCode", (req, res) => {
  const { userId } = req.body;

  // Fetch user data from the database
  const getUserQuery = "SELECT * FROM mas_user WHERE user_id = ?";

  db.query(getUserQuery, [userId], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error fetching user data");
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const referralCode = results[0].referal_code;
    const referralLink = `http://localhost:3003/api/Create_user?ref=${referralCode}`;

    res.status(200).json({ referralCode, referralLink });
  });
});

app.post("/saveFriendNumber", (req, res) => {
  const { user_id, friendNumber } = req.body;

  // Add logic to save friend's number
  // You can insert the friendNumber into the database associated with the userId

  res.status(200).json({ message: "Friend number saved successfully" });
});

app.get("/calculateNumberOfFriends/:userId", (req, res) => {
  const userId = req.params.userId;

  // Add logic to fetch and calculate the number of friends
  // You can query the database to count the number of friends associated with the userId

  const countFriendsQuery =
    "SELECT COUNT(*) AS friendCount FROM friends WHERE user_id = ?";
  db.query(countFriendsQuery, [userId], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error calculating the number of friends");
      return;
    }

    const friendCount = results[0].friendCount;
    res.status(200).json({ friendCount });
  });
});

module.exports = app;
