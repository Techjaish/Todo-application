const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
const toDate = require("date-fns/toDate");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Path = require("path");

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
  const { todoId } = request.params;
  const { priority, status, category, search_q, date } = request.query;
  if (category !== undefined) {
    const categoryArray = ["WORK", "HOME", "LEARNING"];
    const categoryInArray = categoryArray.includes(category);
    if (categoryInArray === true) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }

  if (priority !== undefined) {
    const priorityArray = ["HIGH", "MEDIUM", "LOW"];
    const priorityInArray = priorityArray.includes(priority);
    if (priorityInArray === true) {
      request.priority = priority;
      console.log(request.priority);
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }

  if (status !== undefined) {
    const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    const statusInArray = statusArray.includes(status);
    if (statusInArray === true) {
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
      const formatDate = format(new Date(newDate), "yyyy-MM-dd");
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
  request.id = todoId;
  request.search_q = search_q;

  next();
};

const checkInvalidBody = async (request, response, next) => {
  const { id, todo, category, priority, status, date } = request.body;
  const { todoId } = request.params;
  if (category !== undefined) {
    const categoryArray = ["WORK", "HOME", "LEARNING"];
    const categoryInArray = categoryArray.includes(category);
    if (categoryInArray === true) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }

  if (priority !== undefined) {
    const priorityArray = ["HIGH", "MEDIUM", "LOW"];
    const priorityInArray = priorityArray.includes(priority);
    if (priorityInArray === true) {
      request.priority = priority;
      console.log(request.priority);
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }

  if (status !== undefined) {
    const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    const statusInArray = statusArray.includes(status);
    if (statusInArray === true) {
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
  request.id = id;
  request.todoId = todoId;
  request.todo = todo;
  next();
};

function convertFormatOfRows(eachItem) {
  return {
    id: eachItem.id,
    todo: eachItem.todo,
    priority: eachItem.priority,
    status: eachItem.status,
    category: eachItem.category,
    dueDate: eachItem.due_date,
  };
}
//APKI1
app.get("/todos/", checkInvalidQuery, async (request, response) => {
  const { status = "", search_q = "", priority = "", category = "" } = request;
  console.log(status);

  const selectQuery = `
    
        SELECT 
            id,
            todo,
            priority,
            status,
            category,
            due_date AS dueDate 
        FROM 
            todo
        WHERE 
        todo LIKE '%${search_q}%' AND priority LIKE '%${priority}%' 
        AND status LIKE '%${status}%' AND category LIKE '%${category}%';`;
  const resultArray = await dataBase.all(selectQuery);
  response.send(resultArray);
});

//API2
app.get("/todos/:todoId/", checkInvalidQuery, async (request, response) => {
  const { todoId } = request;
  const selectRowQuery = `
        SELECT 
            id,
            todo,
            priority,
            status,
            category,
            due_date AS dueDate 
        FROM 
            todo WHERE id = ${todoId};`;
  const resultObj = await dataBase.get(selectRowQuery);
  response.send(resultObj);
});

app.get("/agenda/", checkInvalidQuery, async (request, response) => {
  const { date } = request;
  selectQuery = `
  SELECT
  id,
  todo,
  priority,
  status,
  category,
  due_date AS dueDate 
  FROM todo WHERE due_date = ${date}`;
  const resultArray = await dataBase.all(selectQuery);
  response.send(resultArray);
});

app.post("/todos/", checkInvalidBody, async (request, response) => {
  const { id, todo, category, priority, status, date } = request;

  const selectRowQuery = `
  INSERT INTO todo (id, todo, priority, status, category, due_date))
  VALUES (
      ${id},
      '${todo}',
      '${priority}' 
      '${status}', 
      '${category}', 
      ${date}
       );`;
  const resultObj = await dataBase.run(selectRowQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", checkInvalidBody, async (request, response) => {
  let selectRowQuery =;
  const { todoId } = request;
  const { id, todo, category, priority, status, date } = request;
  switch (true) {
    case status !== undefined:
      selectRowQuery = `UPDATE todo SET status = '${status}' WHERE id = ${todoId};`;
      await dataBase.run(selectRowQuery);
      response.send("Status Updated");
      break;
    case priority !== undefined:
      selectRowQuery = `UPDATE todo SET priority = '${priority}' WHERE id = ${todoId};`;
      await dataBase.run(selectRowQuery);
      response.send("Priority Updated");
      break;
    case category !== undefined:
      selectRowQuery = `UPDATE todo SET category = '${category}' WHERE id = ${todoId};`;
      await dataBase.run(selectRowQuery);
      response.send("Category Updated");
      break;
    case todo !== undefined:
      selectRowQuery = `UPDATE todo SET todo = '${todo}' WHERE id = ${todoId};`;
      await dataBase.run(selectRowQuery);
      response.send("Todo Updated");
      break;
    case date !== undefined:
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
