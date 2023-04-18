import express from "express";

const app = express();

const template = `
<html>
<head>
<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
body{background-color:#bbb} *{font-family: 'Poppins'}</style>
</head>
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
