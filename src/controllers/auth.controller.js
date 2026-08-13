const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')


async function userRegister(req, res) {
  const { user_name, email, password } = req.body

  const isExists = await userModel.findOne({
    email: email
  })

  if (isExists) {
    return res.status(422).json({
      message: "User already exists with email"
    })
  }

  const user = await userModel.create({
    email, password, user_name
  })

  const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' })

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
}

async function userLogin(req, res) {
  const { login_id, password } = req.body

  const user = await userModel.findOne({
    $or: [
      { email: login_id },
      { username: login_id }
    ]
  }).select('+password')

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

  const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' })

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

module.exports = { userRegister, userLogin }