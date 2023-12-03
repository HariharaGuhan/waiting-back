const express = require("express");
const app = express.Router();
const db = require("../Database/db");

app.get("/getuser", (req, res) => {
  const selectQuery = ` SELECT 
    u.*, 
    p.mobile_name, 
    p.mobile_model, 
    p.mobile_price, 
    p.offer_price
FROM mas_user u
JOIN mas_product p ON u.user_id = p.user_id`;

  db.query(selectQuery, (error, results) => {
    if (error) {
      console.error("Error retrieving user data:", error);
      return error;
    }
 
    if (results.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Database empty" });
    }

    res.status(200).json({ status: "success", results });
  });
});
app.delete("/deleteUserInAdmin/:user_id", (req, res) => {
  const user_id = req.params.user_id;

  const deleteQuery = "DELETE FROM mas_user WHERE user_id = ?";

  db.query(deleteQuery, [user_id], (error, results) => {
    if (error) {
      console.error("Error deleting user:", error);
      res
        .status(500)
        .json({
          status: "error",
          message: "An error occurred while deleting user",
        });
    } else {
      res.status(200).json({
        status: "success",
        message: "User deleted successfully",
        deletedUser: results.affectedRows > 0,
      });
    }
  });
});

module.exports=app;