const Product = require('../models/product');

const ITEMS_PER_PAGE = 2;

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = '/uploads/'+req.file.filename;
  const price = req.body.price;
  const description = req.body.description;
  //console.log(imageUrl);
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  product
    .save()
    .then(result => {
      // console.log(result);
     // console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      next(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product
      });
    })
    .catch(err => next(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedImage = req.file;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;

  Product.findById(prodId)
    .then(product => {
      if(product.userId.toString() !== req.user._id.toString()){
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if(updatedImage){
        product.imageUrl = '/uploads/'+req.file.filename
      }
      return product.save()
      .then(result => {
       // console.log('UPDATED PRODUCT!');
        res.redirect('/admin/products');
      });
    })
    .catch(err => next(err));
};

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalProducts;
  Product.find({userId: req.user._id})
    .then(products => {
      totalProducts = products.length;
      return Product.find({userId : req.user._id})
              .skip((page-1)*ITEMS_PER_PAGE)
              .limit(ITEMS_PER_PAGE)
    })
    .then(productsList => {
      res.render('admin/products', {
        prods: productsList,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        currentPage: page,
        lastPage: Math.ceil(totalProducts/ITEMS_PER_PAGE)
      });
    })
    .catch(err => next(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({_id: prodId, userId: req.user._id})
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => next(err));
};
