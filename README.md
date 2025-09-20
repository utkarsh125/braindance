So this project is being created as the part of the `websocket` learning modules. What this project does should be pretty self-explanatory - I'm creating `excalidraw` clone, but with some features of my own so that I can use it in the future and make it self host-able for others to use it locally on their own machines. 

##### Technology Stack
- `typescript`
- `monorepos`
- `node + express`
- `canvas`
- `webrtc` (optional)

NOTE: Make a video on the required things for the `monorepo` setup. Hosting it later would require some really solid practices that could actually save me some money - because hosting it on a mere `ec2` container would cost me a lot of money that I do not want to spend - if I had a job that would have been a different case but not at the moment.

**Hosting Options**
- Typical `EC2` setup, deploy the servers over there and be done with it + `nginx`.
- `railway` might actually help with this but a lot of research is needed for that matter.
- A domain name is also important along with a `TSL` certificate to make it work.

#### Creating a `backend-common` to store JWT secret
One of the most important steps in this would be to understand how to keep the secrets in a directory that is common - this suits the `monorepos` setup and centralises the place of export for some things like `JWT_SECRET` or any other secret for that matter.

So here is what I did, I made a `backend-common` directory under `./packages/` directory and then ran `npm init -y` and `npx tsc --init` in order to create two files
- `tsconfig.json`
- `package.json`
This acts as the boilerplate for the shared package. Now some key changes in `package.json`
```json
"name": "@repo/backend-common",
"exports": {
    "./config": "./src/index.ts"
},
"devDependencies": {
    "@repo/typescript-config": "workspace:*"
},
```
and in `tsconfig.json`
```json
{
	"extends": "@repo/typescript-config/base.json",
}
```
as it can be seen that, the `base.json` has been extended here. Now I put all my secret keys in a file inside `/backend-common/src/index.ts`
```js
export const JWT_SECRET = process.env.JWT_SECRET || "123123";
```

**NOTE: In order to use `process.env.ENV_NAME`; must install `@types/node`**

---

Now since the shared secret has a centralised access point, changes to `http` and `ws` can be made, `"@repo/backend-common": "workspace:*"` can be added to the `package.json` for both the apps or all the apps that need that secret. So rather than importing it from some `./config.ts` file that is exclusive only to either `http` or `ws`, I now get to import things simply from the shared secrets package
```ts
import { JWT_SECRET } from "@repo/backend-common/config";
```

---
#### The `common` package
Apart from a common `backend` package, another `common` package is needed as `backend-common` things would either used in `http` or `ws`. The `frontend` would also use type validations and that would come from `zod` - a package that would be used across the entire application.

Install `zod` in `/packages/common`
```js
pnpm install zod
```

Then do the same thing that is necessary for any package to work across the entire workspace. Make changes to `tsconfig.json` and add it as a `devDependency` for `/common`
```json
{
	"extends": "@repo/typescript-config/base.json",
}
```

```json
{
  "name": "@repo/common",
  ...
  "devDependencies": {
    "@repo/typescript-config": "workspace:*"
  },
  ...
  "dependencies": {
    "zod": "^4.1.7"
  }
}

```

Create a `types.ts` file inside `/common/src/`
```ts
import { z } from "zod";

export const CreateUserSchema = z.object({
    username: z.string().min(3).max(20),
    password: z.string(),
    name: z.string()
})

export const SignInSchema = z.object({
    username: z.string().min(3).max(20),
    password:z.string(),
})

export const CreateRoomSchema = z.object({
    name: z.string().min(3).max(20),
})
```

Now the boilerplate is ready, so making it work with `http` and `ws` is simple - add `@repo/common` as `devDependency` for both `http` and `ws` package followed by a global `pnpm install`. The common package is now ready to be used in `http/src/index.ts`.

---
### Setting up Prisma in the monorepo
Writing down these steps has become crucial since sometimes it becomes a hassle to deal with it. The steps are pretty much the same as other packages.
- Initialise an empty project using `npm init -y` and `npx tsc --init`
- Make changes to the `package.json`, specially in the name to `@repo/db`

Follow the steps on [Prisma Setup for Turborepo](https://www.prisma.io/docs/guides/turborepo#1-create-your-monorepo-using-turborepo)

Also do not forget to add it to the exports,
```json
"exports": {
    "./client": "./src/index.ts"
},
```

### How does the Sign Up endpoint works?
```ts
app.post("/signup", async (req, res) => {

  const parsedData = CreateUserSchema.safeParse(req.body);

  if(!parsedData.success){
    res.json({
      message:"Incorrect input",
    })
    return;
  }

  try {
    const user = await prisma.user.create({
      data: {
        username: parsedData.data?.username,
        password: parsedData.data.password,
        email: parsedData.data.email
      }
    })

    res.json({
      userId: user.id,
      message: "User created successfully",
    })

    return;
  } catch (error) {
    console.error(error, "Error creating user");
    res.status(411).json({
      message: "Error creating user",
    })
    return;
  }
});
```


### Websockets (important)
The main crux of this entire project revolves around the very function that websockets provide us - *a full duplex connection (best suited for collaborative tools like shared canvas, chat, etc.*. The problem here is that we can implement this using two approaches 
- A simple MVP approach (can handle 50-100 concurrent users, maybe less)
- A problem broadcasting system using *Redis* (can handle more users, but kinda overkill for a hobby project like this)
Currently, I am proceeding with the MVP approach since scaling it would cost me a lot of money and I do not want to put a hole in my pockets - but I plan to put in a migration plan for people who may use it in future.

**NOTE: Look for the CRDT Algorithm as it simplifies the creation of the core of this project**