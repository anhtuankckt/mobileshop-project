const configModel = require('../models/configModel')
const userModel = require('../models/userModel')
const paginate = require('../../common/paginate')
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const index = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = page * limit - limit

  const configs = await configModel.find().sort({ allow: -1, _id: -1 }).skip(skip).limit(limit)

  const totalRows = await configModel.find().countDocuments()
  const totalPages = Math.ceil(totalRows / limit)

  const user = await userModel.findOne({ email: req.session.email })
  const role = user?.role

  res.render('admin/configs/config', {
    configs,
    currentPage: page,
    totalPages,
    pages: paginate(page, totalPages),
    role
  })
}

const create = async (req, res) => {
  res.render('admin/configs/add_config', {
    data: {},
    config: {
      intro: '',
      address: '',
      service: '',
      hotline_phone: '',
      hotline_email: ''
    }
  })
}

const store = async (req, res) => {
  const { intro, address, service, hotline_phone, hotline_email } = req.body
  const { logo_header, logo_footer } = req.files

  const newConfig = new configModel({
    intro,
    address,
    service,
    hotline_phone,
    hotline_email
  })

  // Kiểm tra file ảnh
  const isImage = (fileName) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png']
    const ext = path.extname(fileName).toLowerCase()
    return imageExtensions.includes(ext)
  }

  if (logo_header && logo_footer) {
    // Xử lí logo_header (hiện đang là array)
    for (let logo of logo_header) {
      if (!isImage(logo.originalname)) {
        const error = 'File được thêm chưa đúng định dạng ảnh!'
        return res.render('admin/configs/add_config', {
          data: { error },
          config: {
            intro,
            address,
            service,
            hotline_phone,
            hotline_email
          }
        })
      }
      const random = uuidv4().slice(0, 6)
      const fileName = `${random}_${logo.originalname}`
      newConfig['logo_header'] = fileName
      fs.renameSync(logo.path, path.resolve('src/public/uploads/images/logo', fileName))
    }

    // Xử lí logo_footer (hiện đang là array)
    for (let logo of logo_footer) {
      if (!isImage(logo.originalname)) {
        const error = 'File được thêm chưa đúng định dạng ảnh!'
        return res.render('admin/configs/add_config', {
          data: { error },
          config: {
            intro,
            address,
            service,
            hotline_phone,
            hotline_email
          }
        })
      }
      const random = uuidv4().slice(3, 6)
      const fileName = `${random}_${logo.originalname}`
      newConfig['logo_footer'] = fileName
      fs.renameSync(logo.path, path.resolve('src/public/uploads/images/logo', fileName))
    }

    await newConfig.save()
    res.redirect('/admin/configs')
  }
}

const edit = async (req, res) => {
  const { id } = req.params
  const config = await configModel.findById(id)

  res.render('admin/configs/edit_config', { data: {}, config })
}

const update = async (req, res) => {
  const { id } = req.params
  const { intro, address, service, hotline_phone, hotline_email } = req.body
  const { logo_header, logo_footer } = req.files
  const config = await configModel.findById(id)

  const updateConfig = {
    intro,
    address,
    service,
    hotline_phone,
    hotline_email
  }

  // Kiểm tra file ảnh
  const isImage = (fileName) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png']
    const ext = path.extname(fileName).toLowerCase()
    return imageExtensions.includes(ext)
  }

  if (logo_header) {
    // logo_header hiện đang ở là array
    for (let logo of logo_header) {
      if (!isImage(logo.originalname)) {
        const error = 'File được thêm chưa đúng định dạng ảnh!'
        return res.render('admin/configs/edit_config', {
          data: { error },
          config: {
            _id: id,
            intro,
            address,
            service,
            hotline_phone,
            hotline_email,
            logo_header: config?.logo_header,
            logo_footer: config?.logo_footer
          }
        })
      }
      const random = uuidv4().slice(0, 6)
      const fileName = `${random}_${logo.originalname}`
      updateConfig['logo_header'] = fileName
      fs.renameSync(logo.path, path.resolve('src/public/uploads/images/logo', fileName))
    }
  }

  if (logo_footer) {
    // logo_footer hiện đang ở là array
    for (let logo of logo_footer) {
      if (!isImage(logo.originalname)) {
        const error = 'File được thêm chưa đúng định dạng ảnh!'
        return res.render('admin/configs/edit_config', {
          data: { error },
          config: {
            _id: id,
            intro,
            address,
            service,
            hotline_phone,
            hotline_email,
            logo_header: config?.logo_header,
            logo_footer: config?.logo_footer
          }
        })
      }
      const random = uuidv4().slice(3, 6)
      const fileName = `${random}_${logo.originalname}`
      updateConfig['logo_footer'] = fileName
      fs.renameSync(logo.path, path.resolve('src/public/uploads/images/logo', fileName))
    }
  }

  await configModel.updateOne({ _id: id }, { $set: updateConfig })
  res.redirect('/admin/configs')
}

const approve = async (req, res) => {
  const { id } = req.params
  const config = await configModel.findById(id)

  if (!config) res.redirect('/admin/configs')

  await configModel.updateOne({ _id: id }, { $set: { allow: true } })

  await configModel.updateMany({ _id: { $ne: id } }, { $set: { allow: false } })

  res.redirect('/admin/configs')
}

const hidden = async (req, res) => {
  const { id } = req.params
  const config = await configModel.findById(id)

  if (!config) res.redirect('/admin/configs')

  await configModel.updateOne({ _id: id }, { $set: { allow: false } })

  res.redirect('/admin/configs')
}

const del = async (req, res) => {
  const { ids } = req.params
  const arrIds = ids.split(',')
  if (!arrIds) res.redirect('/admin/configs')

  for (let id of arrIds) {
    const config = await configModel.findById(id)
    const logo_header = config?.logo_header
    const logo_footer = config?.logo_footer

    await configModel.deleteOne({ _id: id })

    if (logo_header) {
      const filePath = path.resolve('src/public/uploads/images/logo', logo_header)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    if (logo_footer) {
      const filePath = path.resolve('src/public/uploads/images/logo', logo_footer)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }
  }

  res.redirect('/admin/configs')
}

module.exports = {
  index,
  create,
  store,
  edit,
  update,
  del,
  approve,
  hidden
}