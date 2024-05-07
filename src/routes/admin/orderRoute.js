const express = require('express')
const router = express.Router()
const orderController = require('../../apps/controllers/orderController')

// admin/orders
router.get('/', orderController.index)

// admin/orders/delete/:id
router.get('/confirm/:ids', orderController.confirm)

// admin/orders/delete/:id
router.get('/delete/:ids', orderController.del)

// admin/orders/trash
router.get('/trash', orderController.trash)

// admin/orders/trash/restore/:ids
router.get('/trash/restore/:ids', orderController.trashRestore)

// admin/orders/trash/delete/:id
router.get('/trash/delete/:ids', orderController.trashDelete)

module.exports = router