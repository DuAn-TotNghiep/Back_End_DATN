const express = require("express");
const {
  getAllProducts,
  AddProduct,
  RemoveProduct,
  GetOutstan,
  GetSale,
  getNewProduct,
  searchProduct,
  GetOneProduct,
  GetTopSaleProduct,
  CountOrdersToday,
  CountOrdersMonth,
  UpdateProduct,
  SumProductDay,
  FilterProductsByColor,
  FilterProductsBySize,
  FilterProductsByCategory,
  FilterProductsByPrice,
  GetAllProductOff,
  getProductSearchCategory,
  updateOutstanProduct,
  UpdateKho,
  getAllKho,
  CountProductOrder,
  getOneKho,
  HideProduct,
  getAllProductsNoBlock,
  CancellHideProduct,
  RelatedProduct,
  SortProductsByNameZA,
  SortProductsByNameAZ,
  sortProductsByPrice,
  sortProductsByPriceAscending,
  GetAllSale,
  GetAllOutstan,
  GetNewProducts3Days,
  SumKho,
  getAllProductsBlock,
  getAllProductsNoBlock1,
  UpdateImageProduct,
  GetOneProductBlock
} = require("../controller/product");

const router = express.Router();
router.post("/product/add", AddProduct);
router.get("/product", getAllProducts);
router.get("/productnew", getNewProduct);
router.post("/product/search", searchProduct);
router.post("/product/category/search", getProductSearchCategory);
router.patch("/product/:id/hide", HideProduct);
router.patch("/product/:id/cancellHide", CancellHideProduct);
router.get("/product/outstan", GetOutstan);
router.patch("/product/updateoutstanproduct", updateOutstanProduct);
router.get("/product/sale", GetSale);
router.get("/product/:id/getone", GetOneProduct);
router.get("/product/:id/getoneblock", GetOneProductBlock);
router.get("/product/topproductsale", GetTopSaleProduct);
router.get("/product/countproductoday", CountOrdersToday);
router.get("/product/countproductmonth", CountOrdersMonth);
router.patch("/product/:id/update", UpdateProduct);
router.patch("/product/:id/updateimage", UpdateImageProduct);
router.patch("/product/updatekho", UpdateKho);
router.patch("/product/sumkho", SumKho);
router.get("/product/kho", getAllKho);
router.get("/product/:id/kho", getOneKho);
router.get("/product/sumproductday", SumProductDay);
router.get("/product/:id/colorFillter", FilterProductsByColor);
router.get("/product/:id/countproductorder", CountProductOrder);
router.get("/product/:id/sizeFillter", FilterProductsBySize);
router.get("/product/:id/categoryFillter", FilterProductsByCategory);
router.get("/product/priceFillter/:minPrice/:maxPrice", FilterProductsByPrice);
router.get("/product/getalloff", GetAllProductOff);
router.get("/product/noblock", getAllProductsNoBlock);
router.get("/product/noblock1", getAllProductsNoBlock1);
router.get("/product/block", getAllProductsBlock);
router.get("/product/:id/related", RelatedProduct);
router.get("/product/sortAtoZ", SortProductsByNameAZ)
router.get("/product/sortZtoA", SortProductsByNameZA)
router.get("/product/filtermax", sortProductsByPrice)
router.get("/product/filtermin", sortProductsByPriceAscending)
router.get("/product/allsale", GetAllSale);
router.get("/product/alloutstan", GetAllOutstan);
router.get("/product/allproduct3days", GetNewProducts3Days);



module.exports = router;
