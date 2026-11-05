import express from "express";

const app = express();
const port = 3000;

// In-memory storage (posts reset when the server restarts)
let posts = [];
let nextId = 1;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const findPost = (id) => posts.find((p) => p.id === Number(id));

// Home: list all posts (newest first)
app.get("/", (req, res) => {
  res.render("index.ejs", { posts: [...posts].reverse() });
});

// Create form
app.get("/new", (req, res) => {
  res.render("form.ejs", { post: null, error: null });
});

// Create post
app.post("/posts", (req, res) => {
  const title = (req.body.title || "").trim();
  const author = (req.body.author || "").trim();
  const content = (req.body.content || "").trim();
  if (!title || !content) {
    return res
      .status(400)
      .render("form.ejs", { post: { title, author, content }, error: "Title and content are required." });
  }
  posts.push({ id: nextId++, title, author: author || "Anonymous", content, createdAt: new Date(), updatedAt: null });
  res.redirect("/");
});

// View single post
app.get("/posts/:id", (req, res) => {
  const post = findPost(req.params.id);
  if (!post) return res.status(404).render("404.ejs");
  res.render("post.ejs", { post });
});

// Edit form
app.get("/posts/:id/edit", (req, res) => {
  const post = findPost(req.params.id);
  if (!post) return res.status(404).render("404.ejs");
  res.render("form.ejs", { post, error: null });
});

// Update post
app.post("/posts/:id/edit", (req, res) => {
  const post = findPost(req.params.id);
  if (!post) return res.status(404).render("404.ejs");
  const title = (req.body.title || "").trim();
  const author = (req.body.author || "").trim();
  const content = (req.body.content || "").trim();
  if (!title || !content) {
    return res
      .status(400)
      .render("form.ejs", { post: { ...post, title, author, content }, error: "Title and content are required." });
  }
  Object.assign(post, { title, author: author || "Anonymous", content, updatedAt: new Date() });
  res.redirect(`/posts/${post.id}`);
});

// Delete post
app.post("/posts/:id/delete", (req, res) => {
  posts = posts.filter((p) => p.id !== Number(req.params.id));
  res.redirect("/");
});

app.use((req, res) => res.status(404).render("404.ejs"));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
