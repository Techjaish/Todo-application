const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Path = require("path");
const app = express();

app.use(express.json());
const dbPath = Path.join(__dirname, "todoApplication.db");
let dataBase = null;

const initialization = async () => {
  try {
    dataBase = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running http:localhost:3000");
    });
  } catch (e) {
    console.log(`Error Occured: ${e.message}`);
    process.exit(1);
  }
};

initialization();

let value1 = null;
let value2 = null;
let value3 = null;
let value4 = null;
let value5 = null;

function checkInvalid(queryObj) {
  const { priority, status, category, search_q, due_date } = queryObj;
  let condition1 =
    priority !== "HIGH" &&
    priority !== "MEDIUM" &&
    priority !== "LOW" &&
    priority !== undefined;
  let condition2 =
    status !== "TO%20DO" &&
    status !== "IN PROGRESS" &&
    status !== "DONE" &&
    status !== undefined;
  let condition3 =
    category !== "WORK" &&
    category !== "HOME" &&
    category !== "LEARNING" &&
    category !== undefined;
  if (condition1) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (!condition1) {
    if (priority === undefined) {
      value1 = "%%";
    } else {
      value1 = queryObj.priority;
    }
  } else if (condition2) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (!condition2) {
    if (status === undefined) {
      value2 = "%%";
    } else {
      value2 = queryObj.status;
      console.log(value2);
    }
  } else if (condition3) {
    response.category(400);
    response.send("Invalid Todo Category");
  } else if (!condition3) {
    if (category === undefined) {
      value3 = "%%";
    } else {
      value3 = queryObj.category;
    }
  }
  if (search_q === undefined) {
    value4 = "%%";
  } else {
    value4 = queryObj.search_q;
  }
  if (due_date === undefined) {
    value5 = "%%";
  } else {
    value5 = queryObj.due_date;
  }
  return;
}

app.get("/todos/", (request, response) => {
  const queryObj = request.query;
  checkInvalid(queryObj);
  console.log(value2);
});
