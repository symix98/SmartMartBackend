const db = require('../../db/models/index')
const Product = db.products
const {
	successResponse,
	errorResponse,
} = require('../../responseService');
const { Op } = require('sequelize');
module.exports = {
	// This Method Gets All Products	
	async getAllProduct(req, res, next) {
		try {
			const response = await Product.findAll({
				attributes: [
					'pid',
					'pdesc',
					'pprice',
					'imageurl',
					'pshow',
				],
			});
			res.status(200).send(response);
			// successResponse(res, response);
			// next();
		} catch (error) {
			errorResponse(error, 'Could not Perform Operation! ', 400);
		}
	},

	// This Method Gets a Single Product With Specific ID
	async getSingleProductById(req, res, next) {
		try {
			const { id } = req.params;
			const response = await Product.findOne({
				where: {
					pid: id,
				}
			});
			if (response) {
			res.status(200).send(response);
			}
		} catch (error) {
			errorResponse(error, 'Could not Perform Operation! ', 400);
		}
	},

	// This Method Creates a new Product
	async createNewProduct(req, res, next) {
		try {
			const { barcode } = req.body;
			const { description } = req.body;
			const { price } = req.body;
			const { imageurl } = req.body;
			const { ShowHide } = req.body;
			await Product.create({
				pid: barcode,
				pdesc: description,
				pprice: price,
				imageurl,
				pshow: ShowHide,
			})
			successResponse(res, true, "Product Inserted Successfully!");
		} catch (error) {
			errorResponse(error, 'Could not Perform Operation! ', 400);
		}
	},
	// This Method Updates a Single Product
	async updateProduct(req, res, next) {
		try {
			const { description } = req.body;
			const { price } = req.body;
			const { imageurl } = req.body;
			const { ShowHide } = req.body;
			const { pid } = req.params;
			await Product.update({

				pdesc: description,
				pprice: price,
				imageurl,
				pshow: ShowHide,
			}
				,
				{
					where: {
						pid
					}
				}
			);
			successResponse(res, true, "Product Updated Successfully!");
		} catch (error) {
			errorResponse(error, 'Could not Perform Operation! ', 400);
		}
	},
	async searchProductResult(req, res, next) {
		try {
			const { search } = req.body;
			const products = await Product.findAll({
				where: {
					[Op.or]: [
						{
							pdesc: {
								[Op.like]: `%${search}%`
							},
						},
						{
							pid: {
								[Op.like]: `%${search}%`
							}
						}
					]
				},
				attributes: [
					'pid',
					'pdesc',
					'catid',
					'pprice',
					'imageurl',
					'pshow',
				]
			})
			res.status(200).send(products);
		} catch (error) {
			errorResponse(error, 'Could not Perform Operation! ', 400);
		}
	},
};