const express = require("express");
const { getAllProducts, AddProduct, RemoveProduct, GetOutstan, GetSale, getNewProduct, searchProduct, GetOneProduct, GetTopSaleProduct, CountOrdersToday, CountOrdersMonth, UpdateProduct, SumProductDay, FilterProductsByColor, FilterProductsBySize, FilterProductsByCategory, FilterProductsByPrice, GetAllProductOff, getProductSearchCategory, updateOutstanProduct, UpdateKho, getAllKho } = require("../controller/product");
const router = express.Router();
router.post("/product/add", AddProduct);
router.get("/product", getAllProducts);
router.get("/productnew", getNewProduct);
router.post('/product/search', searchProduct)
router.post('/product/category/search', getProductSearchCategory)
router.delete("/product/:id/remove", RemoveProduct);
router.get("/product/outstan", GetOutstan);
router.patch("/product/updateoutstanproduct", updateOutstanProduct);
router.get("/product/sale", GetSale);
router.get("/product/:id/getone", GetOneProduct);
router.get("/product/topproductsale", GetTopSaleProduct);
router.get("/product/countproductoday", CountOrdersToday)
router.get("/product/countproductmonth", CountOrdersMonth);
router.patch("/product/:id/update", UpdateProduct);
router.patch("/product/:id/updatekho",UpdateKho)
router.get("/product/kho", getAllKho)
router.get("/product/sumproductday", SumProductDay);
router.get("/product/:id/colorFillter", FilterProductsByColor);
router.get("/product/:id/sizeFillter", FilterProductsBySize);
router.get("/product/:id/categoryFillter", FilterProductsByCategory);
router.get("/product/priceFillter/:minPrice/:maxPrice", FilterProductsByPrice);
router.get("/product/getalloff", GetAllProductOff);


module.exports = router;