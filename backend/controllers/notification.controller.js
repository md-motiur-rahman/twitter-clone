import Notification from "../models/notification.model.js";

export const getNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const notification = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "fullname profileimage",
    });
    await Notification.updateMany({ to: userId }, { read: true });

    return res.status(200).json(notification);
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ to: userId });

    return res.status(200).json({ message: "Notofication deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user._id;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (notification.to.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to perform this operation" });
    }

    await Notification.findByIdAndDelete(notificationId);

    return res.status(200).json({ message: "Notification is deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
