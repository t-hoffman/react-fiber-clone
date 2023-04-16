import express from "express";

const app = express();

const template = `
<html>
  <body>
    <div id="root"></div>
  </body>
  <script src="bundle.js"></script>
</html>
`;

app.use(express.static("dist"));

app.get("*", (req, res) => {
  res.status(200).send(template);
});

app.listen(3000, () => console.log("Server started!"));
