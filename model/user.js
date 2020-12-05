const { call } = require("body-parser");
const mysql = require("../config/mysql");

class User {
  register(data, callback) {
    let query = `
        INSERT INTO users 
        (firstname, lastname, email, password, empid, organization) 
        VALUES (? ,? ,?, ?, ?, ?)`;
    mysql.query(
      query,
      [
        data.firstname,
        data.lastname,
        data.email,
        data.password,
        data.empid,
        data.organization,
      ],
      (err) => {
        callback(err);
      }
    );
  }
}

module.exports = new User();
