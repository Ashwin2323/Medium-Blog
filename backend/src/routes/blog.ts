import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'
import { createBlogInput, updateBlogInput } from '@ashwin_codes/medium-common';

// Create the main Hono app
export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET:string
    },
    Variables:{
        userId: string,
    }
}>();

blogRouter.use('/*', async (c, next) => {
  const authheader=c.req.header("authorization") || "";
  try{
      const user= await verify(authheader,c.env.JWT_SECRET) as {id:string};
      if(user){
        c.set("userId",user.id);
        await next();
      } else {
        c.status(403)
        return c.json({error:"unauthorized"});
      }
  }catch(e){
    c.status(403);
    return c.json({
        message:"You are not logged in"
    })
  }
});

// Add Pagination
blogRouter.get('/bulk', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
	
	const blogs = await prisma.blog.findMany({
		select:{
			content: true,
			title: true,
			id: true,
			author: {
				select: {
					name:true
				}
			}
		}
	});

	return c.json({blogs});
}); // Keep this before get get(/:id) beacuse it will assume /bulk(id=bulk)

blogRouter.get('/:id', async (c) => {
	const id = c.req.param('id');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
	
	const blog = await prisma.blog.findUnique({
		where: {
			id
		},
		select:{
			title: true,
			content: true,
			author:{
				select:{
					name:true
				}
			}
		}
	});

	return c.json(blog);
});

blogRouter.post('/', async (c) => {
	const body = await c.req.json();
	  const {success}=createBlogInput.safeParse(body);
	  if(!success){
		c.status(411);
		return c.json({message:"Inputs are not correct"})
	  }
	const userId = c.get('userId');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const blog = await prisma.blog.create({
		data: {
			title: body.title,
			content: body.content,
			authorId: userId
		}
	});
	return c.json({
		id: blog.id
	});
});

blogRouter.put('/', async (c) => {
	const body= await c.req.json();
	const {success}=updateBlogInput.safeParse(body);
	if(!success){
	c.status(411);
	return c.json({message:"Inputs are not correct"})
	}
	const userId = c.get('userId');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	prisma.blog.update({
		where: {
			id: body.id,
			authorId: userId
		},
		data: {
			title: body.title,
			content: body.content
		}
	});

	return c.text('updated post');
});


