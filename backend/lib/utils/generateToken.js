import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (uid, res) => {
  const token = jwt.sign({ uid }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true, //secure XXS attacks
    sameSite: "strict", //secure csrf, cross-site forgery attacks
    secure: process.env.NODE_ENV !== "development",
  });
};
