const express = require('express')
const router = express.Router()
const userController = require('../../apps/controllers/userController')
const authMiddleware = require('../../apps/middlewares/authMiddleware')

//GET admin/users
router.get('/', userController.index)

//GET admin/users/create
router.get('/create', authMiddleware.checkRole, userController.create)

//POST admin/users/create
router.post('/create', authMiddleware.checkRole, userController.store)

//GET admin/users/edit/:id
router.get('/edit/:id', authMiddleware.checkRole, userController.edit)

//POST admin/users/edit/:id
router.post('/edit/:id', authMiddleware.checkRole, userController.update)

//GET admin/users/delete/:id
router.get('/delete/:id', authMiddleware.checkRole, userController.del)

//GET admin/users/trash
router.get('/trash', userController.trash)

//GET admin/users/trash/restore/:id
router.get('/trash/restore/:id', authMiddleware.checkRole, userController.trashRestore)

//GET admin/users/trash/delete/:id
router.get('/trash/delete/:id', authMiddleware.checkRole, userController.trashDel)

module.exports = router
