const express = require('express');
const router = express.Router();
const categoryController = require('../../apps/controllers/categoryController')
const authMiddleware = require('../../apps/middlewares/authMiddleware')

//GET admin/categories
router.get('/', categoryController.index)

//GET admin/categories/create
router.get('/create', authMiddleware.checkRole, categoryController.create)

//POST admin/categories/create
router.post('/create', authMiddleware.checkRole, categoryController.store)

//GET admin/categories/edit/:id
router.get('/edit/:id', authMiddleware.checkRole, categoryController.edit)

//POST admin/categories/edit/:id
router.post('/edit/:id', authMiddleware.checkRole, categoryController.update)

//GET admin/categories/delete/:id
router.get('/delete/:id', authMiddleware.checkRole, categoryController.del)

//GET admin/categories/trash
router.get('/trash', categoryController.trash)

//GET admin/categories/trash/restore/:id
router.get('/trash/restore/:id', authMiddleware.checkRole, categoryController.trashRestore)

module.exports = router
