const express = require('express')
const router = express.Router()
const configController = require('../../apps/controllers/configController')
const uploadMiddleware = require('../../apps/middlewares/uploadMiddleware')
const authMiddleware = require('../../apps/middlewares/authMiddleware')

//GET admin/configs
router.get('/', configController.index)

//GET admin/configs/create
router.get('/create', authMiddleware.checkRole, configController.create)

//POST admin/configs/store
router.post('/store', uploadMiddleware.fields([
  { name: 'logo_header', maxCount: 1 },
  { name: 'logo_footer', maxCount: 1 }
]), authMiddleware.checkRole, configController.store)

//GET admin/configs/edit/:id
router.get('/edit/:id', authMiddleware.checkRole, configController.edit)

//POST admin/configs/update/:id
router.post('/update/:id', uploadMiddleware.fields([
  { name: 'logo_header', maxCount: 1 },
  { name: 'logo_footer', maxCount: 1 }
]), authMiddleware.checkRole, configController.update)

//GET admin/configs/delete/:id
router.get('/delete/:ids', authMiddleware.checkRole, configController.del)

//GET admin/configs/approve/:id
router.get('/approve/:id', authMiddleware.checkRole, configController.approve)

//GET admin/configs/hidden/:id
router.get('/hidden/:id', authMiddleware.checkRole, configController.hidden)

module.exports = router