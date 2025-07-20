const express = require("express")
const { registerUser, loginUser, getMe, generateCode } = require("../controllers/userController")
const {protect} = require("../middleware/authMiddleware")
const {getMedicine} = require("../controllers/apiController")
const { createReminder, fetchReminder, deleteReminder } = require("../controllers/reminderController");



const router = express.Router()


router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/getMe', protect, getMe)
router.get('/generateCode', protect, generateCode)
router.get('/getMedicine', protect, getMedicine)
router.post('/createReminder', protect, createReminder);
router.get('/getReminder', protect, fetchReminder);
router.delete('/deleteReminder', protect, deleteReminder);

module.exports = router;