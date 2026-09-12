import Client from "../models/Client.js";
import type { Request, Response } from "express";

export const  createClient = async (req:Request, res: Response ) => {
const userId = res.locals.userId
const {email, projectId} = req.body
const newClient = await Client.create({userId,email, projectId})

return res.status(201).json({message: "Client created"})
}

export const getClient = async (req: Request, res: Response) => {
    const userId = res.locals.userId
    const clients = await Client.find({userId})
    
return res.status(200).json({message: "All clients Found", data: clients})

}

export const getClientbyId = async (req: Request, res: Response) => {
    const {id} = req.params

    const client = await Client.findById({_id: id})

    return res.status(200).json({message: "Client found", data: client})
}