const express = require('express');
const authMiddleware = require('../middlewares/auth')

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  res.send('Vouchers está por aqui funcionando!!! :)', { user: req.userId });
});


module.exports = (app) => app.use("/voucher", router);
