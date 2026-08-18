const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')
const sendRegistrationEmail = require('../services/email.service')
const tokenBlackListModel = require('../models/blackList.model')

async function userRegister(req, res) {
  const { user_name, email, password, systemUser } = req.body

  const isExists = await userModel.findOne({
    $or: [
      { email: email },
      { username: user_name }
    ]
  })

  if (isExists) {
    return res.status(422).json({
      message: "User already exists with email"
    })
  }

  const user = await userModel.create({
    email, password, user_name, systemUser
  })

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' })

  res.cookie('token', token)

  res.status(201).json({
    message: "User Registered",
    data: {
      _id: user._id,
      email: user.email,
      user_name: user.user_name
    },
    token
  })

  await sendRegistrationEmail.sendRegistrationEmail(user.email, user.user_name)
}

async function userLogin(req, res) {
  const { email, password } = req.body

  const user = await userModel.findOne(
    { email: email },
  ).select('+password')

  if (!user) {
    return res.json({
      message: "User not found"
    })
  }

  const checkPassword = await user.comparePassword(password)
  if (!checkPassword) {
    return res.json({
      message: "Incorrect Password"
    })
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' })

  res.cookie('token', token)

  res.status(200).json({
    message: "User Loggedin",
    data: {
      _id: user._id,
      email: user.email,
      user_name: user.user_name
    },
    token
  })
}

async function userLogout(req, res) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(200).json({
      message: "User logged out successfully"
    })
  }

  await tokenBlackListModel.create({
    token: token
  })

  res.clearCookie("token")

  res.status(200).json({
    message: "User logged out successfully"
  })
}


module.exports = {
  userRegister,
  userLogin,
  userLogout
}