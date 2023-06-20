const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
const toDate = require("date-fns/toDate");
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

const checkInvalidQuery = async (request, response, next) => {
  const { priority, status, category, search_q, date } = request.query;
  if (category !== undefined) {
    categoryArray = ["WORK", "HOME", "LEARNING"];
    if (categoryArray.includes(category)) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }

  if (priority !== undefined) {
    priorityArray = ["HIGH", "MEDIUM", "LOW"];
    if (priorityArray.includes(priority)) {
      request.priority = priority;
      console.log(request.priority);
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }

  if (status !== undefined) {
    statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    if (statusArray.includes(status)) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo status");
      return;
    }
  }

  if (date !== undefined) {
    try {
      const newDate = new Date(date);
      console.log(typeof newDate);
      const formatDate = format(newDate, "yyyy-MM-dd");
      const finalDate = toDate(
        new Date(
          `${newDate.getFullYear()}-${
            newDate.getMonth() + 1
          }-${newDate.getDate()}`
        )
      );
      const result = await isValid(finalDate);
      if (result === true) {
        request.date = formatDate;
      }
    } catch (e) {
      response.status(400);
      response.send("Invalid Due Date");
      return;
    }
  }
  if (search_q !== undefined) {
    request.search_q = search_q;
  }
  next();
};

const checkInvalidBody = async (request, response, next) => {
  const { id, todo, category, priority, status, date } = request.body;
  request.id = id;
  request.todo = todo;
  if (category !== undefined) {
    categoryArray = ["WORK", "HOME", "LEARNING"];
    if (categoryArray.includes(category)) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }

  if (priority !== undefined) {
    priorityArray = ["HIGH", "MEDIUM", "LOW"];
    if (priorityArray.includes(priority)) {
      request.priority = priority;
      console.log(request.priority);
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }

  if (status !== undefined) {
    statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    if (statusArray.includes(status)) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo status");
      return;
    }
  }

  if (date !== undefined) {
    try {
      const newDate = new Date(date);
      console.log(typeof newDate);
      const formatDate = format(newDate, "yyyy-MM-dd");
      const finalDate = toDate(new Date(formatDate));
      const result = await isValid(finalDate);
      if (result === true) {
        request.date = formatDate;
      }
    } catch (e) {
      response.status(400);
      response.send("Invalid Due Date");
      return;
    }
  }

  next();
};

function convertFormatOfRows(eachItem) {
  return {
    id: eachItem.id,
    todo: eachItem.todo,
    category: eachItem.category,
    priority: eachItem.priority,
    status: eachItem.status,
    dueDate: eachItem.due_date,
  };
}
//APKI1
app.get("/todos/", checkInvalidQuery, async (request, response) => {
  const { status = "", search_q = "", priority = "", category = "" } = request;

  const selectQuery = `
    SELECT 
    * 
    FROM 
    todo 
    WHERE 
    todo LIKE '%${searchq}%'
    AND category LIKE '%${category}%'
    AND priority LIKE '%${newObj.priority}%' 
    AND status LIKE '%${status}%'`;
  const resultArray = await dataBase.all(selectQuery);
  response.send(resultArray.map((eachItem) => convertFormatOfRows(eachItem)));
});

//API2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const selectRowQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const resultObj = await dataBase.get(selectRowQuery);
  response.send(convertFormatOfRows(resultObj));
});

app.get("/agenda/", checkInvalidQuery, async (request, response) => {
  const { date } = request;
  selectQuery = `SELECT * FROM todo WHERE due_date = ${date}`;
  const resultArray = await dataBase.all(selectQuery);
  response.send(resultArray.map((eachItem) => convertFormatOfRows(eachItem)));
});

app.post("/todos/", checkInvalidBody, async (request, response) => {
  const {
    id,
    todo,
    status = "",
    category = "",
    priority = "",
    status = "",
    date,
  } = request;

  const selectRowQuery = `
  INSERT INTO todo (id, todo, category, priority, status, due_date)
  VALUES (
      ${id},
      '${todo}',
      '${category}' 
      '${priority}', 
      '${status}', 
      ${date}
       );`;
  const resultObj = await dataBase.get(selectRowQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", checkInvalidBody, async (request, response) => {
  let selectRowQuery;
  const { todoId } = request.params;
  const {
    id,
    todo,
    status = "",
    category = "",
    priority = "",
    status = "",
    date,
  } = request;
  switch (true) {
    case newObj.status !== "":
      selectRowQuery = `UPDATE todo SET status = '${status}' WHERE id = ${todoId};`;
      await dataBase.run(selectRowQuery);
      response.send("Status Updated");
      break;
    case newObj.priority !== "":
      selectRowQuery = `UPDATE todo SET priority = '${priority}' WHERE id = ${priority};`;
      await dataBase.run(selectRowQuery);
      response.send("Priority Updated");
      break;
    case newObj.category !== "":
      selectRowQuery = `UPDATE todo SET category = '${category}' WHERE id = ${category};`;
      await dataBase.run(selectRowQuery);
      response.send("Category Updated");
      break;
    case newObj.todo !== "":
      selectRowQuery = `UPDATE todo SET todo = '${todo}' WHERE id = ${todoId};`;
      await dataBase.run(selectRowQuery);
      response.send("Todo Updated");
      break;
    default:
      selectRowQuery = `UPDATE todo SET due_date = '${date}' WHERE id = ${todoId};`;
      await dataBase.run(selectRowQuery);
      response.send("Due Date Updated");
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo WHERE id = ${todoId};`;
  await dataBase.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
