const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Teste para reset de senha Multiverso");
});

require("./app/controllers/index")(app);

app.listen(3000);
