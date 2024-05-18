const express = require('express')
const router = express.Router()
const customerController = require('../../apps/controllers/customerController')
const authMiddleware = require('../../apps/middlewares/authMiddleware')

//GET admin/customers
router.get('/', customerController.index)

//GET admin/customers/delete/:id
router.get('/delete/:id', authMiddleware.checkRole, customerController.del)

//GET admin/customers/trash
router.get('/trash', customerController.trash)

//GET admin/customers/trash/restore/:id
router.get('/trash/restore/:id', authMiddleware.checkRole, customerController.trashRestore)

//GET amin/customers/trash/delete/:id
router.get('/trash/delete/:id', authMiddleware.checkRole, customerController.trashDel)

module.exports = router