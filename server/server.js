import express from 'express'
import "dotenv/config"
import cors from "cors"
import connectDB from './config/db.js'
import dns from 'dns';
import userRouter from './routes/userRoutes.js';
import ownerRouter from './routes/ownerRoutes.js';
import bookingRouter from './routes/booingRoutes.js';

// ✅ DNS fix
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express()

//connect Database
await connectDB()

//Middleware
app.use(cors())
app.use(express.json()) //use to convert the json response into javascript object

app.get('/', (req, res) =>  res.send("Server is running"))
app.use('/api/user', userRouter)
app.use('/api/owner', ownerRouter)
app.use('/api/bookings', bookingRouter)


const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server is started at :- ${PORT}`))
