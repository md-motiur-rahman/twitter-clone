import express from "express"
import { protectedRoute } from "../middlewares/protectedRoute.js"
import { deleteNotification, deleteNotifications, getNotification } from "../controllers/notification.controller.js"

const notificationRouter = express.Router()

notificationRouter.get("/", protectedRoute, getNotification)
notificationRouter.delete("/", protectedRoute, deleteNotifications)
notificationRouter.delete("/:id", protectedRoute, deleteNotification)

export default notificationRouter