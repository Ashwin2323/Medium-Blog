import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'
import {signupInput, signinInput} from '@ashwin_codes/medium-common'

// Create the main Hono app
export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET:string
    }
}>();

// userRouter.use('/api/v1/blog/*', async (c, next) => {
//   const header=c.req.header("authorization") || "";

//   const token = header.split(" ")[1];

//   const response= await verify(token,c.env.JWT_SECRET)
//   if(response.id){
//     next()
//   } else {
//     c.status(403)
//     return c.json({error:"unauthorized"});
//   }
// })

userRouter.post('/signup', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  
  const body= await c.req.json();
  const {success}=signupInput.safeParse(body);
  if(!success){
    c.status(411);
    return c.json({message:"Inputs are not correct"})
  }
  try {
        const user = await prisma.user.create({
            data: {
                email: body.email,
                password: body.password,
                name: body.name
            }
        });
        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
        return c.json({ jwt });
    } catch(e) {
        c.status(403);
        return c.json({ error: "error while signing up" });
    }
})


userRouter.post('/signin', async (c) => {
    const body = await c.req.json(); 
    const {success}=signinInput.safeParse(body);
    if(!success){
      c.status(411);
      return c.json({message:"Inputs are not correct"})
    }
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL	,
    }).$extends(withAccelerate());

    const user = await prisma.user.findUnique({
        where: {
            email: body.email,
            password:body.password
        }
    });

    if (!user) {
        c.status(403);
        return c.json({ error: "user not found" });
    }

    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ jwt });
})