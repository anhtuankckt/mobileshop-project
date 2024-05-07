const express = require('express')
const router = express.Router()
const advertiseController = require('../../apps/controllers/advertiseController')
const uploadMiddleware = require('../../apps/middlewares/uploadMiddleware')
const authMiddleware = require('../../apps/middlewares/authMiddleware')

/** SLIDERS */
//GET admin/advertises
router.get('/sliders', advertiseController.index)

//GET admin/advertises/sliders/create
router.get('/sliders/create', authMiddleware.checkRole, advertiseController.createSlider)

//POST admin/advertises/sliders/create
router.post('/sliders/create',
  uploadMiddleware.fields([{ name: 'thumbnails' }]),
  authMiddleware.checkRole,
  advertiseController.storeSlider)

//GET admin/advertises/sliders/delete/:ids
router.get('/sliders/delete/:ids', authMiddleware.checkRole, advertiseController.delSliders)

//GET admin/advertises/sliders/approve/:id
router.get('/sliders/approve/:id', authMiddleware.checkRole, advertiseController.aprroveSlider)

//GET admin/advertises/sliders/off/:id
router.get('/sliders/off/:id', authMiddleware.checkRole, advertiseController.offSlider)

/** BANNERS */
//GET admin/advertises/banner
router.get('/banners', advertiseController.banner)

//GET admin/advertises/banners/create
router.get('/banners/create', authMiddleware.checkRole, advertiseController.createBanner)

//POST admin/advertises/banners/create
router.post('/banners/create',
  uploadMiddleware.fields([{ name: 'thumbnails' }]),
  authMiddleware.checkRole,
  advertiseController.storeBanner)

//GET admin/advertises/banners/delete/:ids
router.get('/banners/delete/:ids', authMiddleware.checkRole, advertiseController.delBanners)

//GET admin/advertises/banners/approve/:id
router.get('/banners/approve/:id', authMiddleware.checkRole, advertiseController.aprroveBanner)

//GET admin/advertises/banners/off/:id
router.get('/banners/off/:id', authMiddleware.checkRole, advertiseController.offBanner)

module.exports = router