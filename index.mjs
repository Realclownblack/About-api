import fastify from 'fastify'
import { DataTypes, Sequelize } from 'sequelize'
import cors from '@fastify/cors'

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'banco.sqlite'
})

try {
    await sequelize.authenticate();
    console.log('Conectei com o banco de dados com sucesso.')
} catch (error) {
    console.log('Erro ao conectar com banco de dados: ', error)
}

const Post = sequelize.define('Post', {
    category: DataTypes.STRING,
    title: DataTypes.STRING,
    content: DataTypes.STRING
})
const Comment = sequelize.define('Comment', {
    content: DataTypes.STRING
})

Post.hasMany(Comment)
Comment.belongsTo(Post)

// await Post.sync({ force: true })
// await Comment.sync({ force: true })

const app = fastify()

app.register(cors, { origin: true })

app.get("/post", async (req, res) => {
    const posts = await Post.findAll()

    return res.send(posts)
})

app.post("/post", async (req, res) => {
    const post = Post.build(req.body)
    await post.save()

    return res.send({ ok: true, post: post })
})

app.delete("/post/:id", async (req, res) => {
    const postId = req.params.id
    const postADeletar = await Post.findByPk(postId)
    postADeletar.destroy()
    return res.send({ msg: `Deletado post ${postADeletar.title} com sucesso.`})
})

app.post("/comment", (req, res) => {
    const comment = Comment.build(req.body)
    comment.save()

    res.send({ ok: true, comment: comment })
})

app.get("/post/:id/comments", async (req, res) => {
    const comments = await Comment.findAll({
        where: {
            PostId: req.params.id
        }
    })

    res.send(comments)
})

app.listen(3000);
