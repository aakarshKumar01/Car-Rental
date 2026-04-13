import imagekit from '../config/imageKit.js'
import User from "../models/User.js"
import fs from 'fs'
import Car from "../models/Car.js"
import Booking from '../models/Booking.js'


//API to change role to owner
export const changeRoleToOwner = async (req, res) => {
    try {
        const {_id} = req.user
        await User.findByIdAndUpdate(_id, {role : "owner"})
        res.json({success : true, message: "Now you can list cars"})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

//API to List Car
export const addCar = async (req, res) => {
    try {
        const {_id} = req.user
        let car = JSON.parse(req.body.carData)
        const imageFile = req.file
        console.log(imageFile)
        //upload image to image kit
        const fileBuffer = fs.readFileSync(imageFile.path)
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/cars'
        })
        console.log("Upload response filePath:", response.filePath)

        //optimization through imagekit url transofrmation
        var optimizedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                {
                    width: '1280', //width resizing
                    quality: '80', //Auto compression
                    format: 'webp'
                } //convert to modern formate
            ]
        })

        
        const image = optimizedImageUrl

        await Car.create({...car, owner: _id, image})

        res.json({success: true, message: "Car Added"})

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

//API to list Owner Cars
export const getOwnerCars = async (req, res) => {
    try {
        const {_id} = req.user
        const cars = await Car.find({owner: _id})
        res.json({success: true, cars})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

//API to Toggle Car Availability
export const toggleCarAvailability = async (req, res) => {
    try {
        const {_id} = req.user;
        const {carId} = req.body
        const car = await Car.findById(carId)
        if(car.owner.toString() != _id.toString()){
            return res.json({success: false, message: "Unauthorized"})
        }

        car.isAvailable = !car.isAvailable
        await car.save()

        res.json({success: true, message: 'Availability toggle'})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

//API to delete a car
export const deleteCar = async(req, res) => {
    try {
        const {_id} = req.user
        const {carId} = req.body
        const car = await Car.findById(carId)

        //checking is car belongs to the user
        if(car.owner.toString() !== _id.toString()) {
            return res.json({success: false, message: "Unauthorized"})
        }

        //we will not delete the actual car database because if someone book this car then this will in the user history so that we can only remove the user of the car and make it null
        car.owner = null
        car.isAvailable = false
        
        await car.save()

        res.json({success: true, message: "car removed"})

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

//API to get Dashboard Data
export const getDashboardData = async(req, res) => {
    try {
        const {_id, role} = req.user
        console.log("=== DASHBOARD DEBUG ===")
        console.log("User _id:", _id)
        console.log("User role:", role)
        
        if(role !== 'owner') {
            return res.json({success: false, message: "Unauthorized"})
        }

        const cars = await Car.find({owner: _id})
        console.log("Cars found:", cars.length)
        const bookings = await Booking.find({owner: _id}).populate('car').sort({createdAt: -1})
        console.log("Bookings found:", bookings.length)
        const pendingBookings = await Booking.find({owner: _id, status: 'pending'})
        const completedBookings = await Booking.find({owner: _id, status: 'confirmed'})

        //calculate monthlyRevenue from bookings where status is confirmed
        const monthlyRevenue = bookings.slice().filter(booking => booking.status === 'confirmed').reduce((acc, booking) => acc + booking.price, 0)

        const dashboardData = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completedBookings: completedBookings.length,
            recentBookings: bookings.slice(0, 3),
            monthlyRevenue
        }

        res.json({success: true, dashboardData})

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

//API to get Owner Bookings
export const getOwnerBookings = async(req, res) => {
    try {
        if(req.user.role !== 'owner') {
            return res.json({success: false, message: 'Unauthorized'})
        }
        const bookings = await Booking.find({owner: req.user._id})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

//API to update user image
export const updateUserImage = async(req, res) => {
    try {
        const {_id} = req.user
        const imageFile = req.file
        //upload image to image kit
        const fileBuffer = fs.readFileSync(imageFile.path)
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/users'
        })
        console.log("Upload response filePath:", response.filePath)

        //optimization through imagekit url transofrmation
        var optimizedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                    {
                    width: '400', //width resizing
                    quality: '80', //Auto compression
                    format: 'webp'
                } //convert to modern formate
            ]
        })
        
        const image = optimizedImageUrl
        await User.findByIdAndUpdate(_id, {image})
        res.json({success: true, message: "Image Updated"})

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}