import { Hono} from 'hono'
import { basicAuth } from 'hono/basic-auth'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import postgres from "postgres";

const pg = postgres(process.env.POSTGRES_CONNECTION_STRING)


const app = new Hono()
app.use('*', logger())
app.use('*', cors('*'))
app.use('*', basicAuth({
    username: process.env.BASIC_USERNAME,
    password: process.env.BASIC_PASSWORD
}))

app.get('/health', async (c) => {

    
    return c.json({ ok: true}, 200)

})

app.post('/readings', async (c) => {

    const { readings, ...rest } = c.req.json()
    const [data] = await pg`insert into aq_readings ${pg({
        timestamp: rest.timestamp,
        uid: rest.uid,
        nickname: rest.nickname,
        model: rest.model,
        voltage: readings.voltage,
        temperature: readings.temperature,
        humidity: readings.humidity,
        pressure: readings.pressure,
        noise: readings.noise,
        pm1: readings.pm1,
        pm2_5: readings.pm2_5,
        pm10: readings.pm10
    })} returning *`;


    return c.json(data, 201)
})

export default app
serve({ fetch: app.fetch, port: process.env.PORT }, (info) => {
    console.log(`Listening on http://${info.address}:${info.port}`)
})