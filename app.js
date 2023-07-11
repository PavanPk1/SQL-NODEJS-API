const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const express = require("express");
const app = express();
const path = require("path");
app.use(express.json());
const databasePath = path.join(__dirname, "todoApplication.db");
let database = null;
const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
//API 1
app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;
  let query = `SELECT
            *
        FROM
            todo `;
  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = query += ` WHERE
            todo LIKE '%${search_q}%'
            AND status = '${status}'
            AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = query += ` WHERE
            todo LIKE '%${search_q}%'
            AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = query += ` WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = query += ` WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await database.all(getTodosQuery);
  response.send(data);
});
//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `
    SELECT * FROM todo WHERE todo.id = ${todoId};`;
  const result = await database.get(query);
  response.send(result);
});
//API 3
app.post("/todos/", async (req, res) => {
  const { id, todo, priority, status } = req.body;
  const query = `
    INSERT INTO todo(id,todo,priority,status) VALUES
    (${id},'${todo}','${priority}','${status}');`;
  await database.run(query);
  res.send("Todo Successfully Added");
});
//API 4
app.put("/todos/:todoId/", async (request, response) => {
  const { status, priority, todo, search_q = "" } = request.body;
  const { todoId } = request.params;
  let query = `UPDATE todo SET `;
  let result = null;
  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = query += `status = '${status}',
            priority = '${priority}' WHERE id = ${todoId};`;
      result = await database.run(getTodosQuery);
      response.send("Status & Priority Updated");
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = query += `priority = '${priority}' WHERE id = ${todoId};`;
      result = await database.run(getTodosQuery);
      response.send("Priority Updated");
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = query += `status = '${status}' WHERE id = ${todoId};`;
      result = await database.run(getTodosQuery);
      response.send("Status Updated");
      break;
    default:
      getTodosQuery = query += `todo = '%${search_q}%' WHERE id = ${todoId};`;
      result = await database.run(getTodosQuery);
      response.send("Todo Updated");
  }
});
//API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `
    DELETE FROM todo WHERE id = ${todoId};`;
  await database.run(query);
  response.send("Todo Deleted");
});
module.exports = app;
