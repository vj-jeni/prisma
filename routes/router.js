const express = require("express");
const router = express.Router();
const User = require("../controller/student");

router.post('/register', User.register);
router.get('/getAll', User.getAll),
router.get('/get/:id/id', User.getById);
router.put('/update/:id/id', User.updateById)
router.delete('/delete/:id/id', User.deleteById)
//router.delete('/deleteAll', User.deleteAll)
router.post('/registerMany', User.registerMany);

module.exports = router