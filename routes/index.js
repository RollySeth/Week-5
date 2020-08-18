const { Router } = require("express");
const router = Router();

router.use("/items",require('./items'));
router.use("/orders",require('./orders'));
router.use("/login",require('./login'));

module.exports = router;