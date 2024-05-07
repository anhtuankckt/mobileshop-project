const vndPrice = (price) => {
  const priceFormat = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  })

  return priceFormat.format(price).replace("₫", "")
}

module.exports = vndPrice
