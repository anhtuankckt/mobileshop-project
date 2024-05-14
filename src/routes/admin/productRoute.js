const express = require('express')
const router = express.Router()
const productController = require('../../apps/controllers/productController')
const uploadMiddleware = require('../../apps/middlewares/uploadMiddleware')
const authMiddleware = require('../../apps/middlewares/authMiddleware')

//GET admin/products
router.get('/', productController.index)

//GET admin/products/create
router.get('/create', authMiddleware.checkRole, productController.create)

//POST admin/products/create
router.post(
  '/create',
  uploadMiddleware.fields([{ name: 'thumbnails' }]),
  authMiddleware.checkRole,
  productController.store
)

//GET admin/products/edit/:id
router.get('/edit/:id', authMiddleware.checkRole, productController.edit)

//POST admin/products/edit/:id
router.post(
  '/edit/:id',
  uploadMiddleware.fields([{ name: 'thumbnails' }]),
  authMiddleware.checkRole,
  productController.update
)

//GET admin/products/delete/:id
router.get('/delete/:ids', authMiddleware.checkRole, productController.del)

//GET admin/products/trash
router.get('/trash', productController.trash)

//GET admin/products/trash/restore/:id
router.get('/trash/restore/:ids', authMiddleware.checkRole, productController.trashRestore)

//GET admin/products/trash/delete/:id
router.get('/trash/delete/:ids', authMiddleware.checkRole, productController.trashDel)

module.exports = router
