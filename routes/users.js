const express = require('express');
const router = express();

router.get('/', ( req, res ) => {
    res.json({ msg: 'this is the user route'});
});

router.post('/', ( req, res ) => {
    res.json();
});

module.exports = router;