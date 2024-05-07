const express = require('express')
const router = express.Router()
const commentController = require('../../apps/controllers/commentController')
const authMiddleware = require('../../apps/middlewares/authMiddleware')

//GET /admin/comments
router.get('/', commentController.index)

//GET /admin/comments/delete/:id
router.get('/delete/:ids', authMiddleware.checkRole, commentController.del)

//GET /admin/comments/aprrove/:id
router.get('/approve/:id', authMiddleware.checkRole, commentController.approve)

module.exports = router