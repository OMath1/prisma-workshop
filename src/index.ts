import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

app.get("/users", async (req, res) => {
  try {
    const result = await prisma.user.findMany();
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post(`/signup`, async (req, res) => {
  const { name, email } = req.body;

  try {
    const result = await prisma.user.create({
      data: {
        name,
        email,
      },
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post(`/post`, async (req, res) => {
  const { title, content, authorEmail } = req.body;

  try {
    const result = await prisma.post.create({
      data: {
        title,
        content,
        author: {
          connect: {
            email: authorEmail,
          },
        },
      },
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.put("/post/:id/views", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prisma.post.update({
      where: {
        id: Number(id),
      },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.put("/publish/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prisma.post.update({
      where: {
        id: Number(id),
      },
      data: {
        published: true,
      },
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.get("/user/:id/drafts", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prisma.user
      .findUnique({
        where: {
          id: Number(id),
        },
      })
      .posts({
        where: {
          published: false,
        },
      });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.get(`/post/:id`, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prisma.post.findUnique({
      where: {
        id: Number(id),
      },
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.get("/feed", async (req, res) => {
  const { searchString, skip, take } = req.query;

  // operador ternario que 
  // 1. CASO a requisição contemple o PARAM "searchString", retorna a
  // condição OR do prisma contemplando "title" e "content", 
  // 2. caso contrario é retornado um array vazio.
  const or = searchString
    ? {
        OR: [
          { title: { contains: searchString as string } },
          { content: { contains: searchString as string } },
        ],
      }
    : {};


    // resultado da query aonde serão puxados todos os 
    // 1. posts que tenham o estado pulished como "true" 
    // e 
    // 2. contempla e insere o conjunto de arrays(por meio do spread operator) que podem ter sido 
    // buscados usando o operador OR do prisma
    // e por ultimo 
    // 3. contém á paginação.
  const result = await prisma.post.findMany({
    where: {
      published: true,
      ...or,
    },
    skip: Number(skip) || undefined,
    take: Number(take) || undefined,
  });

  res.json(result);
});

app.listen(3000, () =>
  console.log(`🚀 Server ready at: http://localhost:3000`)
);
