import { URLEndpoints } from "@imagekit/nodejs/resources/accounts/url-endpoints.mjs"
import imagekit from '../config/imageKit.js'
import User from "../models/User.js"
import fs from 'fs'
import Car from "../models/Car.js"
import { format } from "path"

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

        //upload image to image kit
        const fileBuffer = fs.readFileSync(imageFile.path)
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/cars'
        })

        //optimization through imagekit url transofrmation
        var optimizedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                {width: '120'}, //width resizing
                {quality: 'auto'}, //Auto compression
                {format: 'webp'} //convert to modern formate
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