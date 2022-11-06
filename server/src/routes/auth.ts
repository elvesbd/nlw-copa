import { FastifyInstance } from "fastify"
import { prisma } from "../lib/prisma"
import { authenticate } from "../plugins/authenticate"
import { z } from 'zod'
import fetch from 'node-fetch'

export async function authRoutes(fastify: FastifyInstance) {
  fastify.get('/me', { onRequest: [authenticate] }, async (request, reply) => {
    return { user: request.user }
  })

  fastify.post('/users', async (request, reply) => {
    const createUserDTO = z.object({
      access_token: z.string(),
    })

    const { access_token } = createUserDTO.parse(request.body)

    const userGoogleResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })    

    const userData = await userGoogleResponse.json()    

    const userInfoDTO = z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      picture: z.string().url()
    })

    const userInfo = userInfoDTO.parse(userData)

    let user = await prisma.user.findUnique({
      where: {
        googleId: userInfo.id
      }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          avatarUrl: userInfo.picture
        }
      })
    }

    const token = fastify.jwt.sign({
      name: user.name,
      avatarUrl: user.avatarUrl
    }, {
      sub: user.id,
      expiresIn: '2 days'
    })

    return { token }
    
  })
}